import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BetaWaitlistDialog } from './BetaWaitlistDialog';
import { ColorModeProvider } from '../theme/ColorModeProvider';
import { WAITLIST } from '../content/site';

const openDialog = () => {
  const onClose = vi.fn();
  render(
    <ColorModeProvider>
      <BetaWaitlistDialog open planName="Balancr Pro" onClose={onClose} />
    </ColorModeProvider>,
  );
  return { onClose };
};

describe('BetaWaitlistDialog', () => {
  it('names the plan that opened it', () => {
    openDialog();
    expect(screen.getByRole('heading', { name: /balancr pro reserved/i })).toBeInTheDocument();
  });

  it('rejects an empty address without claiming success', async () => {
    const user = userEvent.setup();
    openDialog();

    await user.click(screen.getByRole('button', { name: WAITLIST.submitLabel }));

    expect(
      screen.getByText('Enter the email address for the invite.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(/nothing was sent or stored/i)).not.toBeInTheDocument();
  });

  it.each(['not-an-email', 'missing@tld', 'two@@example.com', 'spaces in@example.com'])(
    'rejects %s',
    async (value) => {
      const user = userEvent.setup();
      openDialog();

      await user.type(screen.getByRole('textbox', { name: WAITLIST.emailLabel }), value);
      await user.click(screen.getByRole('button', { name: WAITLIST.submitLabel }));

      expect(
        screen.getByText('That does not look like an email address.'),
      ).toBeInTheDocument();
    },
  );

  it.each(['founder@example.com', 'a.b+tag@sub.example.co.uk'])(
    'accepts %s',
    async (value) => {
      const user = userEvent.setup();
      openDialog();

      await user.type(screen.getByRole('textbox', { name: WAITLIST.emailLabel }), value);
      await user.click(screen.getByRole('button', { name: WAITLIST.submitLabel }));

      expect(screen.getByText(/nothing was sent or stored/i)).toBeInTheDocument();
    },
  );

  it('states plainly that there is no backend behind the form', () => {
    openDialog();
    // The source export showed a success toast implying a stored address. There
    // is no API for this yet, so the copy must not imply otherwise.
    expect(screen.getAllByText(WAITLIST.notWiredNotice).length).toBeGreaterThan(0);
    expect(screen.queryByText(/reserved your spot/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/check your inbox/i)).not.toBeInTheDocument();
  });

  it('clears a stale error as soon as the address is edited', async () => {
    const user = userEvent.setup();
    openDialog();

    await user.click(screen.getByRole('button', { name: WAITLIST.submitLabel }));
    expect(screen.getByText(/enter the email address/i)).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: WAITLIST.emailLabel }), 'a');
    expect(screen.queryByText(/enter the email address/i)).not.toBeInTheDocument();
  });

  it('offers every announced device option', () => {
    openDialog();
    expect(
      screen.getByRole('combobox', { name: WAITLIST.deviceLabel }),
    ).toBeInTheDocument();
    expect(WAITLIST.devices.length).toBeGreaterThanOrEqual(3);
  });

  it('closes through the cancel button and the close icon', async () => {
    const user = userEvent.setup();
    const { onClose } = openDialog();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Close dialog' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});