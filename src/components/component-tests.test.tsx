import { vi, describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test/test-utils';
import { useFinanceStore } from '../store/useFinanceStore';
import { useAuthStore } from '../store/useAuthStore';
import { TransactionError } from '../components/TransactionError';
import AccountCard from '../components/dashboard/AccountCard.component';

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
