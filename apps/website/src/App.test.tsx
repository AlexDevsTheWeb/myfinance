import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { ECOSYSTEM, FAQ, HERO, NAV_LINKS, PLANS, SEO } from './content/site';

const SECTION_IDS = ['top', 'ecosystem', 'features', 'pricing', 'privacy', 'faq'];

beforeEach(() => {
  window.localStorage.clear();
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

describe('landing page', () => {
  it('renders every section anchor that navigation points at', () => {
    render(<App />);
    for (const id of SECTION_IDS) {
      expect(document.getElementById(id)).not.toBeNull();
    }
    for (const link of NAV_LINKS) {
      expect(document.querySelector(link.href)).not.toBeNull();
    }
  });

  it('applies the SEO title and description to the document', async () => {
    render(<App />);
    await waitFor(() => expect(document.title).toBe(SEO.title));
    expect(document.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      SEO.description,
    );
  });

  it('shows the hero copy and both calls to action', () => {
    render(<App />);
    expect(screen.getByText(HERO.statusPill)).toBeInTheDocument();
    // The primary CTA is the conversion path and opens the waitlist; the
    // secondary one is an in-page jump to the cockpit illustration.
    expect(screen.getByRole('button', { name: HERO.primaryCta })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: HERO.secondaryCta })).toHaveAttribute(
      'href',
      '#cockpit',
    );
  });

  it('opens the waitlist from the hero CTA', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: HERO.primaryCta }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAccessibleName(/balancr pro reserved|early access/i);
  });

  it('labels the cockpit illustration as sample data', () => {
    render(<App />);
    expect(screen.getByRole('figure', { name: /illustration of the balancr cockpit/i })).toBeInTheDocument();
    expect(screen.getByText(/illustrative sample data/i)).toBeInTheDocument();
  });

  it('switches the cockpit demo tabs', async () => {
    const user = userEvent.setup();
    render(<App />);

    const tabs = screen.getByRole('tablist', { name: /cockpit demo view/i });
    expect(within(tabs).getByRole('tab', { name: 'Overview' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.click(within(tabs).getByRole('tab', { name: 'Transactions' }));
    expect(within(tabs).getByRole('tab', { name: 'Transactions' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByText('4 entries')).toBeInTheDocument();
  });

  it('sends the shipped web platform to an absolute app URL', () => {
    render(<App />);
    const link = screen.getByRole('link', { name: 'Open in browser' });
    expect(link.getAttribute('href')).toMatch(/^https:\/\//);
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('opens the waitlist from the beta platforms, not a dead store link', async () => {
    const user = userEvent.setup();
    render(<App />);

    const beta = ECOSYSTEM.platforms.find((platform) => platform.id === 'android')!;
    await user.click(screen.getByRole('button', { name: beta.action.label }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('textbox')).toBeInTheDocument();
  });

  it('re-prices Pro when the billing cycle changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByText('€ 9.99')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Annual' }));
    expect(screen.getByText('€ 6.58')).toBeInTheDocument();
    expect(screen.getByText('billed annually at € 79')).toBeInTheDocument();
  });

  it('carries the selected plan into the dialog', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: PLANS[1].cta.label }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: /balancr pro reserved/i })).toBeInTheDocument();
  });

  it('toggles between dark and light from the navbar', async () => {
    const user = userEvent.setup();
    render(<App />);

    const toggle = screen.getByRole('button', { name: /switch to light theme/i });
    await user.click(toggle);
    expect(window.localStorage.getItem('balancr-website-color-mode')).toBe('light');
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument();
  });

  it('renders all four FAQ answers behind their questions', () => {
    render(<App />);
    for (const item of FAQ.items) {
      expect(screen.getByRole('button', { name: item.q })).toBeInTheDocument();
    }
  });

  it('does not link footer items that have no destination', () => {
    render(<App />);
    // "Roadmap" and "Support" have no page yet; the export rendered them as
    // link-styled spans, which reads as broken navigation.
    const footer = screen.getByRole('contentinfo');
    expect(within(footer).queryByRole('link', { name: 'Roadmap' })).not.toBeInTheDocument();
    expect(within(footer).getByText('Roadmap')).toBeInTheDocument();
    expect(within(footer).getByRole('link', { name: 'Pricing' })).toHaveAttribute(
      'href',
      '#pricing',
    );
  });
});