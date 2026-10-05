import { describe, expect, it } from 'vitest';
import {
  APP_LINKS,
  BILLING_CYCLE_LABELS,
  ECOSYSTEM,
  FAQ,
  HERO,
  NAV_LINKS,
  PILLARS,
  PLANS,
  PRO_PRICES,
  SECURITY,
  type BillingCycle,
} from './site';
import { isIconName } from '../components/iconMap';

/**
 * The source export duplicated pricing across three DOM nodes and drifted: a
 * stray `€ 19,99` matched no plan, and `setBillingCycle` wrote the amount,
 * period and small print separately. These assertions exist so that class of
 * bug cannot come back through the data model.
 */
describe('pricing model', () => {
  const cycles = Object.keys(PRO_PRICES) as BillingCycle[];

  it('has a label and a price for every billing cycle', () => {
    expect(cycles.sort()).toEqual(Object.keys(BILLING_CYCLE_LABELS).sort());
    for (const cycle of cycles) {
      expect(BILLING_CYCLE_LABELS[cycle]).toBeTruthy();
      expect(PRO_PRICES[cycle].amount).toMatch(/^€\s?[\d.,]+$/);
      expect(PRO_PRICES[cycle].period).toBeTruthy();
    }
  });

  it('agrees with the pricing published on the site', () => {
    expect(PRO_PRICES.monthly).toEqual({
      amount: '€ 9.99',
      period: '/ month',
      note: 'billed monthly',
    });
    expect(PRO_PRICES.annual).toEqual({
      amount: '€ 6.58',
      period: '/ month',
      note: 'billed annually at € 79',
    });
    expect(PRO_PRICES.lifetime).toEqual({
      amount: '€ 199',
      period: '/ one time',
      note: 'perpetual licence, no renewal',
    });
  });

  it('keeps the annual note consistent with its monthly-equivalent figure', () => {
    // € 79 / 12 = € 6.58 rounded. If the annual price is ever edited, this
    // catches a period label that no longer matches the charge.
    const yearly = Number(PRO_PRICES.annual.note?.match(/€\s?([\d.]+)/)?.[1] ?? '0');
    const perMonth = Number(PRO_PRICES.annual.amount.replace(/[^\d.]/g, ''));
    expect(Math.abs(yearly / 12 - perMonth)).toBeLessThanOrEqual(0.01);
  });

  it('declares exactly three plans with unique ids', () => {
    expect(PLANS.map((plan) => plan.id)).toEqual(['starter', 'pro', 'lifetime']);
    expect(new Set(PLANS.map((plan) => plan.id)).size).toBe(PLANS.length);
  });

  it('prices only Pro from the cycle table', () => {
    for (const plan of PLANS) {
      if (plan.id === 'pro') {
        expect(plan.fixedPrice).toBeUndefined();
      } else {
        expect(plan.fixedPrice).toBeDefined();
      }
    }
  });

  it('gives every plan a CTA and at least four comparable features', () => {
    for (const plan of PLANS) {
      expect(plan.cta.label).toBeTruthy();
      expect(['contained', 'outlined', 'text']).toContain(plan.cta.variant);
      expect(plan.features.length).toBeGreaterThanOrEqual(4);
      for (const feature of plan.features) {
        expect(typeof feature.included).toBe('boolean');
      }
    }
  });
});

describe('content integrity', () => {
  it('points every navbar link at a section that exists', () => {
    const ids = new Set([
      'top',
      'how-it-works',
      'cockpit',
      'ecosystem',
      'features',
      'pricing',
      'privacy',
      'faq',
    ]);
    for (const link of NAV_LINKS) {
      expect(link.href.startsWith('#')).toBe(true);
      expect(ids.has(link.href.slice(1))).toBe(true);
    }
  });

  it('has copy for every FAQ entry', () => {
    expect(FAQ.items.length).toBeGreaterThanOrEqual(4);
    for (const item of FAQ.items) {
      expect(item.q.length).toBeGreaterThan(10);
      expect(item.a.length).toBeGreaterThan(40);
    }
  });

  it('ships a visual figure for each pillar', () => {
    expect(PILLARS).toHaveLength(3);
    for (const pillar of PILLARS) {
      expect(pillar.mock).toBeDefined();
      expect(pillar.mock?.rows.length).toBeGreaterThanOrEqual(3);
      expect(pillar.mock?.total.value).toBeTruthy();
    }
  });

  it('names only icons the lookup table actually resolves', () => {
    const names = [
      ...HERO.trustBar.map((item) => item.icon),
      ...ECOSYSTEM.platforms.map((platform) => platform.icon),
      ...PILLARS.map((pillar) => pillar.icon),
      ...SECURITY.cards.map((card) => card.icon),
      'checkCircle',
      'close',
    ];
    const unknown = names.filter((name) => !isIconName(name));
    // An unknown name silently renders the fallback glyph, which is easy to
    // miss in review; this turns it into a failing test.
    expect(unknown).toEqual([]);
  });

  it('only sends the shipped platform to a live URL', () => {
    const shipped = ECOSYSTEM.platforms.filter(
      (platform) => platform.statusTone === 'available',
    );
    expect(shipped).toHaveLength(1);
    expect(shipped[0].action.href).toBe(APP_LINKS.dashboard);
    for (const platform of ECOSYSTEM.platforms.filter(
      (candidate) => candidate.statusTone !== 'available',
    )) {
      expect('href' in platform.action).toBe(false);
    }
  });
});