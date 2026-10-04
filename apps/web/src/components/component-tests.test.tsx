import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { renderWithProviders } from '../test/test-utils';
import { i18n } from '../test/setup';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { TransactionError } from '../components/TransactionError';
import AccountCard from '../components/dashboard/AccountCard.component';
import { MonthCalendar } from '../components/dashboard/MonthCalendar';

// Mock firebase/firestore (some components may import it transitively)
vi.mock('firebase/firestore', async () => {
  const fake = await import('../test/firestore-fake');
  return {
    doc: fake.doc,
    collection: fake.collection,
    setDoc: fake.setDoc,
    updateDoc: fake.updateDoc,
    deleteDoc: fake.deleteDoc,
    getDocs: fake.getDocs,
    writeBatch: fake.writeBatch,
    arrayUnion: fake.arrayUnion,
    runTransaction: fake.runTransaction,
    Timestamp: { now: () => ({ seconds: Date.now() / 1000, nanoseconds: 0 }) },
  };
});
vi.mock('../lib/firebase', () => ({ db: {} }));
vi.mock('../lib/i18n', () => ({
  default: { language: 'it', changeLanguage: vi.fn() },
}));

beforeEach(() => {
  useFinanceStore.setState({
    saveError: null,
    transactions: [],
    categories: [],
    incomeCategories: [],
    accounts: [],
    cards: [],
    deletedRecurringInstances: [],
    isLoading: false,
    isSaving: false,
  });
  useAuthStore.setState({ user: null, loading: false, isLoggingOut: false });
});

// ─── TransactionError ────────────────────────────────────────────────────────

describe('TransactionError', () => {
  it('renders nothing when saveError is null', () => {
    renderWithProviders(<TransactionError />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders error message when saveError is set', () => {
    useFinanceStore.setState({ saveError: 'Something went wrong' });
    renderWithProviders(<TransactionError />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('dismisses error when close button is clicked', async () => {
    const user = userEvent.setup();
    useFinanceStore.setState({ saveError: 'Test error' });
    renderWithProviders(<TransactionError />);

    const closeBtn = screen.getByRole('button', { name: /dismiss/i });
    await user.click(closeBtn);

    expect(useFinanceStore.getState().saveError).toBeNull();
  });
});

// ─── AccountCard ─────────────────────────────────────────────────────────────

describe('AccountCard', () => {
  it('renders account name and balance', () => {
    renderWithProviders(
      <AccountCard
        name="Main Account"
        currentBalance={1500}
        initialBalance={1000}
        history={[]}
      />
    );

    expect(screen.getByText('Main Account')).toBeInTheDocument();
    expect(screen.getByText(/1500/)).toBeInTheDocument();
  });

  it('shows positive diff when current > initial', () => {
    renderWithProviders(
      <AccountCard
        name="Savings"
        currentBalance={2000}
        initialBalance={1000}
        history={[]}
      />
    );

    expect(screen.getByText(/\+.*1000/)).toBeInTheDocument();
  });

  it('shows negative diff when current < initial', () => {
    renderWithProviders(
      <AccountCard
        name="Checking"
        currentBalance={500}
        initialBalance={1000}
        history={[]}
      />
    );

    expect(screen.getByText(/-500/)).toBeInTheDocument();
  });
});

// ─── MonthCalendar ───────────────────────────────────────────────────────────

describe('MonthCalendar', () => {
  it('lists the selected day transactions and live-updates on insert', async () => {
    const user = userEvent.setup();
    const today = dayjs().format('YYYY-MM-DD');
    // pick an "other" day in the current month that is never today
    const otherDayNum = dayjs().date() === 15 ? 16 : 15;
    const otherDay = dayjs().date(otherDayNum).format('YYYY-MM-DD');

    useFinanceStore.setState({
      transactions: [
        {
          id: 'tx-1', date: today, description: 'Stipendio',
          category: 'Reddito', subcategory: 'Main', amount: 2500,
          type: 'income', accountId: 'acc-1',
        },
        {
          id: 'tx-2', date: otherDay, description: 'Netflix',
          category: 'Abbonamenti', subcategory: 'Streaming', amount: 15.99,
          type: 'expense', accountId: 'acc-1',
        },
      ],
    });

    renderWithProviders(<MonthCalendar />);

    // default selection = today
    expect(await screen.findByText('Stipendio')).toBeInTheDocument();

    // switch to the other day via the calendar grid
    const dayBtn = (await screen.findByText(String(otherDayNum))).closest('button');
    expect(dayBtn).not.toBeNull();
    await user.click(dayBtn!);
    expect(await screen.findByText('Netflix')).toBeInTheDocument();
    expect(screen.queryByText('Stipendio')).not.toBeInTheDocument();

    // live update: a transaction inserted into the store while mounted appears
    useFinanceStore.setState((s) => ({
      transactions: [
        ...s.transactions,
        {
          id: 'tx-3', date: otherDay, description: 'Ricarica',
          category: 'Auto', subcategory: 'Benzina', amount: 40,
          type: 'expense', accountId: 'acc-1',
        },
      ],
    }));
    expect(await screen.findByText('Ricarica')).toBeInTheDocument();
    expect(screen.getByText('Netflix')).toBeInTheDocument();
  });

  it('shows the empty state for a day without transactions', async () => {
    const user = userEvent.setup();
    const emptyDayNum = dayjs().date() === 27 ? 26 : 27;

    useFinanceStore.setState({
      transactions: [
        {
          id: 'tx-today', date: dayjs().format('YYYY-MM-DD'), description: 'Rata',
          category: 'Abbonamenti', subcategory: 'Mutuo', amount: 800,
          type: 'expense', accountId: 'acc-1',
        },
      ],
    });

    renderWithProviders(<MonthCalendar />);
    expect(await screen.findByText('Rata')).toBeInTheDocument();

    const dayBtn = (await screen.findByText(String(emptyDayNum))).closest('button');
    await user.click(dayBtn!);

    expect(await screen.findByText(i18n.t('dashboard.calendar.noTransactions'))).toBeInTheDocument();
    expect(screen.queryByText('Rata')).not.toBeInTheDocument();
  });
});
