import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FaqAccordion } from './FaqAccordion';
import { ColorModeProvider } from '../theme/ColorModeProvider';
import { FAQ } from '../content/site';

const renderFaq = () => {
  const onOpenWaitlist = vi.fn();
  render(
    <ColorModeProvider>
      <FaqAccordion onOpenWaitlist={onOpenWaitlist} />
    </ColorModeProvider>,
  );
  return { onOpenWaitlist };
};

describe('FaqAccordion', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('opens the first answer by default', () => {
    renderFaq();
    const first = screen.getByRole('button', { name: FAQ.items[0].q });
    expect(first).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(FAQ.items[0].a)).toBeVisible();
  });

  it('collapses the open answer and expands the next one', async () => {
    const user = userEvent.setup();
    renderFaq();

    const first = screen.getByRole('button', { name: FAQ.items[0].q });
    const second = screen.getByRole('button', { name: FAQ.items[1].q });
    expect(second).toHaveAttribute('aria-expanded', 'false');

    await user.click(second);

    expect(second).toHaveAttribute('aria-expanded', 'true');
    expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText(FAQ.items[0].a)).not.toBeVisible();
  });

  it('collapses when the open item is clicked again', async () => {
    const user = userEvent.setup();
    renderFaq();

    const first = screen.getByRole('button', { name: FAQ.items[0].q });
    await user.click(first);
    expect(first).toHaveAttribute('aria-expanded', 'false');
  });

  it('wires each question to its own panel for screen readers', () => {
    renderFaq();
    for (const [index, item] of FAQ.items.entries()) {
      const button = screen.getByRole('button', { name: item.q });
      const panelId = button.getAttribute('aria-controls');
      expect(panelId).toBeTruthy();
      expect(button.getAttribute('id')).toBeTruthy();
      // MUI only renders the region for the expanded item, so the relationship
      // is asserted on the open one and on the button attributes for the rest.
      expect(button).toHaveAttribute('aria-expanded', index === 0 ? 'true' : 'false');
    }

    const open = screen.getByRole('region');
    const openButton = screen.getByRole('button', { name: FAQ.items[0].q });
    expect(open.id).toBe(openButton.getAttribute('aria-controls'));
    expect(open).toHaveAttribute('aria-labelledby', openButton.id);
  });

  it('routes the contact CTA to the caller', async () => {
    const user = userEvent.setup();
    const { onOpenWaitlist } = renderFaq();

    await user.click(screen.getByRole('button', { name: /talk to the desk/i }));
    expect(onOpenWaitlist).toHaveBeenCalledTimes(1);
  });

  it('keeps every question visible without opening it', () => {
    renderFaq();
    // Each question is an h3 heading holding a button, so the list stays
    // navigable by heading even though only one answer is rendered.
    for (const item of FAQ.items) {
      expect(screen.getByRole('button', { name: item.q }).closest('h3')).not.toBeNull();
    }
    const rendered = screen.getByRole('region');
    expect(within(rendered).getByText(FAQ.items[0].a)).toBeInTheDocument();
    for (const item of FAQ.items.slice(1)) {
      expect(within(rendered).queryByText(item.a)).toBeNull();
    }
  });
});