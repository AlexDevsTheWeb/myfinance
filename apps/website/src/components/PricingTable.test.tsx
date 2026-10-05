import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PricingTable } from './PricingTable';
import { ColorModeProvider } from '../theme/ColorModeProvider';
import { PLANS } from '../content/site';

const renderPricing = (cycle: 'monthly' | 'annual' | 'lifetime' = 'monthly') => {
  const onCycleChange = vi.fn();
  const onSelectPlan = vi.fn();
  const utils = render(
    <ColorModeProvider>
      <PricingTable
        cycle={cycle}
        onCycleChange={onCycleChange}
        onSelectPlan={onSelectPlan}
      />
    </ColorModeProvider>,
  );
  return { ...utils, onCycleChange, onSelectPlan };
};

const proCard = () => screen.getByRole('heading', { name: /balancr pro/i }).closest('article')!;

describe('PricingTable', () => {
  it('shows the monthly Pro price and amount with its period label', () => {
    renderPricing('monthly');
    const card = proCard();
    expect(within(card).getByText('€ 9.99')).toBeInTheDocument();
    expect(within(card).getByText('/ month')).toBeInTheDocument();
    expect(within(card).getByText('billed monthly')).toBeInTheDocument();
  });

  it('updates the amount, period and small print together', async () => {
    const user = userEvent.setup();
    const { onCycleChange } = renderPricing('monthly');

    await user.click(screen.getByRole('button', { name: 'Annual' }));

    expect(onCycleChange).toHaveBeenCalledWith('annual');
    // The bug this guards: the export's setBillingCycle updated the amount but
    // left the old period label behind.
    expect(onCycleChange).toHaveBeenCalledTimes(1);
  });

  it('keeps fixed-price tiers unchanged across cycles', async () => {
    const user = userEvent.setup();
    renderPricing('monthly');

    const starter = screen.getByRole('heading', { name: /starter/i }).closest('article')!;
    const lifetime = screen.getByRole('heading', { name: /founder lifetime/i }).closest('article')!;
    expect(within(starter).getByText('€ 0')).toBeInTheDocument();
    expect(within(lifetime).getByText('€ 199')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Lifetime' }));
    expect(within(starter).getByText('€ 0')).toBeInTheDocument();
  });

  it('does not collapse the selection when the active cycle is clicked again', async () => {
    const user = userEvent.setup();
    const { onCycleChange } = renderPricing('monthly');

    await user.click(screen.getByRole('button', { name: 'Monthly' }));
    expect(onCycleChange).not.toHaveBeenCalled();
  });

  it('reports the chosen plan to the caller instead of navigating', async () => {
    const user = userEvent.setup();
    const { onSelectPlan } = renderPricing('monthly');

    await user.click(screen.getByRole('button', { name: PLANS[2].cta.label }));

    expect(onSelectPlan).toHaveBeenCalledWith(expect.objectContaining({ id: 'lifetime' }));
  });

  it('renders every plan with an accessible name', () => {
    renderPricing('monthly');
    for (const plan of PLANS) {
      expect(screen.getByRole('heading', { name: new RegExp(plan.name, 'i') })).toBeInTheDocument();
    }
  });

  it('marks the highlighted plan for assistive tech, not colour alone', () => {
    renderPricing('monthly');
    const card = proCard();
    expect(within(card).getByText('Most chosen')).toBeInTheDocument();
  });
});