import { vi, describe, it, expect, beforeEach } from 'vitest';
import { db as fakeDb, _resetFakeFirestore, _seedDoc, _getDocData } from '../test/firestore-fake';
import { mockAuthStore } from '../test/mock-auth';

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
    query: (ref: unknown) => ref,
    orderBy: () => ({}),
    limit: (n: number) => ({ _limit: n }),
  };
});
vi.mock('../lib/firebase', () => ({ db: fakeDb }));
vi.mock('../lib/i18n', () => ({
  default: { language: 'it', changeLanguage: vi.fn() },
}));
vi.mock('../hooks/useHistoricalSnapshots', () => ({
  recordPortfolioSnapshot: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('./useAuthStore', () => mockAuthStore());

import { useInvestmentStore, calcAccruedInterest } from './useInvestmentStore';

const TEST_UID = 'test-user-123';
const userPath = `users/${TEST_UID}`;

function resetStore() {
  useInvestmentStore.setState({
    etfTransactions: [],
    portfolioSnapshots: [],
    brokerAccounts: [
      { id: 'broker-1', name: 'Trade Republic', ticker: 'EUNL', baseLumpSum: 0, monthlyPacAmount: 100, interestRate: 3.5 },
    ],
    pacState: { lastGenerationDate: null, pendingTransaction: null, perBrokerLastGeneration: {} },
    prices: {},
    cashAdjustments: [],
    dividendEntries: [],
    isSaving: false,
    isLoading: false,
    saveError: null,
  });
}

beforeEach(() => {
  _resetFakeFirestore();
  resetStore();
  _seedDoc(userPath, {
    etfTransactions: [],
    portfolioSnapshots: [],
    brokerAccounts: useInvestmentStore.getState().brokerAccounts,
    brokerConfig: { brokerName: 'Trade Republic', lumpSumAmount: 0, monthlyPacAmount: 100, ticker: 'EUNL', interestRate: 3.5 },
    cashAdjustments: [],
    dividendEntries: [],
    pacState: useInvestmentStore.getState().pacState,
  });
});

// ─── calcAccruedInterest (pure function) ─────────────────────────────────────

describe('calcAccruedInterest', () => {
  it('calculates monthly interest from annual rate', () => {
    // 1000 * (3.5 / 100) / 12 = 1000 * 0.035 / 12 ≈ 2.9167
    expect(calcAccruedInterest(1000, 3.5)).toBeCloseTo(2.9167, 4);
  });

  it('returns 0 for zero balance', () => {
    expect(calcAccruedInterest(0, 5)).toBe(0);
  });

  it('returns 0 for zero rate', () => {
    expect(calcAccruedInterest(1000, 0)).toBe(0);
  });

  it('handles negative balance (loan interest)', () => {
    // -500 * (2 / 100) / 12 ≈ -0.8333
    expect(calcAccruedInterest(-500, 2)).toBeCloseTo(-0.8333, 4);
  });
});

// ─── ETF Transaction CRUD ────────────────────────────────────────────────────

describe('addEtfTransaction', () => {
  it('adds ETF transaction and computes snapshot', async () => {
    await useInvestmentStore.getState().addEtfTransaction({
      id: 'etf-1', date: '2026-08-15', ticker: 'EUNL', description: 'Buy',
      type: 'buy', units: 10, price: 80, totalAmount: 800, accountId: 'broker-1',
    });

    const state = useInvestmentStore.getState();
    expect(state.etfTransactions).toHaveLength(1);
    expect(state.etfTransactions[0].ticker).toBe('EUNL');
    expect(state.portfolioSnapshots).toHaveLength(1);
    expect(state.portfolioSnapshots[0].totalInvested).toBe(800);
    expect(state.saveError).toBeNull();

    // Verify Firestore
    const userData = _getDocData(userPath);
    expect(userData!.etfTransactions).toHaveLength(1);
  });

  it('rejects ETF transaction with empty ticker', async () => {
    await useInvestmentStore.getState().addEtfTransaction({
      id: 'etf-1', date: '2026-08-15', ticker: '', description: 'Buy',
      type: 'buy', units: 10, price: 80, totalAmount: 800, accountId: 'broker-1',
    });

    expect(useInvestmentStore.getState().etfTransactions).toHaveLength(0);
    expect(useInvestmentStore.getState().saveError).toBeDefined();
  });

  it('rejects ETF transaction with zero units', async () => {
    await useInvestmentStore.getState().addEtfTransaction({
      id: 'etf-1', date: '2026-08-15', ticker: 'EUNL', description: 'Buy',
      type: 'buy', units: 0, price: 80, totalAmount: 800, accountId: 'broker-1',
    });

    expect(useInvestmentStore.getState().etfTransactions).toHaveLength(0);
  });

  it('sorts transactions by date descending', async () => {
    await useInvestmentStore.getState().addEtfTransaction({
      id: 'etf-1', date: '2026-08-01', ticker: 'EUNL', description: 'Early',
      type: 'buy', units: 5, price: 80, totalAmount: 400, accountId: 'broker-1',
    });
    await useInvestmentStore.getState().addEtfTransaction({
      id: 'etf-2', date: '2026-08-20', ticker: 'EUNL', description: 'Late',
      type: 'buy', units: 5, price: 80, totalAmount: 400, accountId: 'broker-1',
    });

    const dates = useInvestmentStore.getState().etfTransactions.map(t => t.date);
    expect(dates).toEqual(['2026-08-20', '2026-08-01']);
  });
});

describe('updateEtfTransaction', () => {
  it('updates an existing ETF transaction', async () => {
    await useInvestmentStore.getState().addEtfTransaction({
      id: 'etf-1', date: '2026-08-15', ticker: 'EUNL', description: 'Buy',
      type: 'buy', units: 10, price: 80, totalAmount: 800, accountId: 'broker-1',
    });

    await useInvestmentStore.getState().updateEtfTransaction({
      id: 'etf-1', date: '2026-08-15', ticker: 'EUNL', description: 'Updated',
      type: 'buy', units: 15, price: 85, totalAmount: 1275, accountId: 'broker-1',
    });

    const tx = useInvestmentStore.getState().etfTransactions.find(t => t.id === 'etf-1')!;
    expect(tx.description).toBe('Updated');
    expect(tx.units).toBe(15);
  });

  it('rejects update with invalid data', async () => {
    await useInvestmentStore.getState().addEtfTransaction({
      id: 'etf-1', date: '2026-08-15', ticker: 'EUNL', description: 'Valid',
      type: 'buy', units: 10, price: 80, totalAmount: 800, accountId: 'broker-1',
    });

    await useInvestmentStore.getState().updateEtfTransaction({
      id: 'etf-1', date: '2026-08-15', ticker: '', description: 'Bad',
      type: 'buy', units: 10, price: 80, totalAmount: 800, accountId: 'broker-1',
    });

    const tx = useInvestmentStore.getState().etfTransactions.find(t => t.id === 'etf-1')!;
    expect(tx.description).toBe('Valid');
  });
});

describe('deleteEtfTransaction', () => {
  it('removes transaction and recomputes snapshot', async () => {
    await useInvestmentStore.getState().addEtfTransaction({
      id: 'etf-1', date: '2026-08-15', ticker: 'EUNL', description: 'Buy',
      type: 'buy', units: 10, price: 80, totalInvested: 800, accountId: 'broker-1',
    } as never);

    await useInvestmentStore.getState().deleteEtfTransaction('etf-1');

    expect(useInvestmentStore.getState().etfTransactions).toHaveLength(0);
    // Should have a new snapshot recomputed (empty portfolio)
    const snapshots = useInvestmentStore.getState().portfolioSnapshots;
    expect(snapshots.length).toBeGreaterThanOrEqual(1);
  });

  it('sets error when transaction not found', async () => {
    await useInvestmentStore.getState().deleteEtfTransaction('nonexistent');
    expect(useInvestmentStore.getState().saveError).toBe('Transaction not found');
  });
});

// ─── Broker Account CRUD ─────────────────────────────────────────────────────

describe('addBrokerAccount', () => {
  it('adds broker account', async () => {
    await useInvestmentStore.getState().addBrokerAccount({
      id: 'broker-2', name: 'IBKR', ticker: 'VWCE', baseLumpSum: 500, monthlyPacAmount: 200, interestRate: 0,
    });

    expect(useInvestmentStore.getState().brokerAccounts).toHaveLength(2);
    expect(useInvestmentStore.getState().brokerAccounts[1].name).toBe('IBKR');
  });

  it('rejects invalid broker account', async () => {
    await useInvestmentStore.getState().addBrokerAccount({
      id: 'broker-2', name: '', ticker: 'VWCE', baseLumpSum: 500, monthlyPacAmount: 200, interestRate: 0,
    });

    expect(useInvestmentStore.getState().brokerAccounts).toHaveLength(1);
    expect(useInvestmentStore.getState().saveError).toBeDefined();
  });
});

describe('updateBrokerAccount', () => {
  it('updates broker account', async () => {
    await useInvestmentStore.getState().updateBrokerAccount({
      id: 'broker-1', name: 'Updated Broker', ticker: 'VWCE', baseLumpSum: 1000, monthlyPacAmount: 150, interestRate: 2.5,
    });

    const broker = useInvestmentStore.getState().brokerAccounts.find(b => b.id === 'broker-1')!;
    expect(broker.name).toBe('Updated Broker');
    expect(broker.interestRate).toBe(2.5);
  });
});

describe('deleteBrokerAccount', () => {
  it('removes broker account', async () => {
    useInvestmentStore.setState({
      brokerAccounts: [
        { id: 'broker-1', name: 'TR', ticker: 'EUNL', baseLumpSum: 0, monthlyPacAmount: 0, interestRate: 0 },
        { id: 'broker-2', name: 'IBKR', ticker: 'VWCE', baseLumpSum: 0, monthlyPacAmount: 0, interestRate: 0 },
      ],
    });

    await useInvestmentStore.getState().deleteBrokerAccount('broker-2');

    expect(useInvestmentStore.getState().brokerAccounts).toHaveLength(1);
    expect(useInvestmentStore.getState().brokerAccounts[0].id).toBe('broker-1');
  });
});

// ─── setBrokerConfig (legacy) ────────────────────────────────────────────────

describe('setBrokerConfig', () => {
  it('maps legacy config to brokerAccounts', async () => {
    await useInvestmentStore.getState().setBrokerConfig({
      brokerName: 'New Broker', lumpSumAmount: 1000, monthlyPacAmount: 200, ticker: 'VWCE', interestRate: 3,
    });

    const state = useInvestmentStore.getState();
    expect(state.brokerAccounts).toHaveLength(1);
    expect(state.brokerAccounts[0].name).toBe('New Broker');
    expect(state.brokerAccounts[0].ticker).toBe('VWCE');
    expect(state.brokerConfig.brokerName).toBe('New Broker');
  });
});

// ─── Cash Adjustments ────────────────────────────────────────────────────────

describe('addCashAdjustment', () => {
  it('adds cash adjustment', async () => {
    await useInvestmentStore.getState().addCashAdjustment({
      id: 'adj-1', brokerId: 'broker-1', amount: 500, date: '2026-08-15',
    });

    expect(useInvestmentStore.getState().cashAdjustments).toHaveLength(1);
    expect(useInvestmentStore.getState().cashAdjustments[0].amount).toBe(500);
  });

  it('rejects adjustment with zero amount', async () => {
    await useInvestmentStore.getState().addCashAdjustment({
      id: 'adj-1', brokerId: 'broker-1', amount: 0, date: '2026-08-15',
    });

    expect(useInvestmentStore.getState().cashAdjustments).toHaveLength(0);
    expect(useInvestmentStore.getState().saveError).toBeDefined();
  });
});

describe('deleteCashAdjustment', () => {
  it('removes cash adjustment', async () => {
    useInvestmentStore.setState({
      cashAdjustments: [{ id: 'adj-1', brokerId: 'broker-1', amount: 500, date: '2026-08-15' }],
    });
    _seedDoc(userPath, { ..._getDocData(userPath)!, cashAdjustments: useInvestmentStore.getState().cashAdjustments });

    await useInvestmentStore.getState().deleteCashAdjustment('adj-1');

    expect(useInvestmentStore.getState().cashAdjustments).toHaveLength(0);
  });
});

// ─── Dividend Entries ────────────────────────────────────────────────────────

describe('addDividendEntry', () => {
  it('adds dividend entry', async () => {
    await useInvestmentStore.getState().addDividendEntry({
      id: 'div-1', brokerId: 'broker-1', ticker: 'EUNL', amount: 25, date: '2026-08-15', type: 'dividend',
    });

    expect(useInvestmentStore.getState().dividendEntries).toHaveLength(1);
    expect(useInvestmentStore.getState().dividendEntries[0].amount).toBe(25);
  });

  it('rejects entry with empty ticker', async () => {
    await useInvestmentStore.getState().addDividendEntry({
      id: 'div-1', brokerId: 'broker-1', ticker: '', amount: 25, date: '2026-08-15', type: 'dividend',
    });

    expect(useInvestmentStore.getState().dividendEntries).toHaveLength(0);
    expect(useInvestmentStore.getState().saveError).toBeDefined();
  });
});

describe('deleteDividendEntry', () => {
  it('removes dividend entry', async () => {
    useInvestmentStore.setState({
      dividendEntries: [{ id: 'div-1', brokerId: 'broker-1', ticker: 'EUNL', amount: 25, date: '2026-08-15', type: 'dividend' }],
    });
    _seedDoc(userPath, { ..._getDocData(userPath)!, dividendEntries: useInvestmentStore.getState().dividendEntries });

    await useInvestmentStore.getState().deleteDividendEntry('div-1');

    expect(useInvestmentStore.getState().dividendEntries).toHaveLength(0);
  });
});

// ─── PAC ─────────────────────────────────────────────────────────────────────

describe('PAC operations', () => {
  it('addPendingPacTransaction stores pending state', () => {
    useInvestmentStore.getState().addPendingPacTransaction({
      brokerId: 'broker-1', amount: 100, date: '2026-08-01', status: 'pending',
    });

    const pac = useInvestmentStore.getState().pacState;
    expect(pac.pendingTransaction).not.toBeNull();
    expect(pac.pendingTransaction!.amount).toBe(100);
    expect(pac.perBrokerLastGeneration['broker-1']).toBe('2026-08');
  });

  it('confirmPacTransaction creates ETF transaction and clears pending', async () => {
    useInvestmentStore.getState().addPendingPacTransaction({
      brokerId: 'broker-1', amount: 100, date: '2026-08-01', status: 'pending',
    });

    await useInvestmentStore.getState().confirmPacTransaction('broker-1');

    const state = useInvestmentStore.getState();
    expect(state.etfTransactions).toHaveLength(1);
    expect(state.etfTransactions[0].ticker).toBe('EUNL'); // from broker-1 config
    expect(state.etfTransactions[0].totalAmount).toBe(100);
    expect(state.pacState.pendingTransaction).toBeNull();
  });

  it('dismissPacTransaction clears pending without creating transaction', () => {
    useInvestmentStore.getState().addPendingPacTransaction({
      brokerId: 'broker-1', amount: 100, date: '2026-08-01', status: 'pending',
    });

    useInvestmentStore.getState().dismissPacTransaction();

    expect(useInvestmentStore.getState().pacState.pendingTransaction).toBeNull();
    expect(useInvestmentStore.getState().etfTransactions).toHaveLength(0);
  });
});

// ─── Snapshot operations ─────────────────────────────────────────────────────

describe('recomputeSnapshots', () => {
  it('updates snapshot holdings with new prices', () => {
    useInvestmentStore.setState({
      portfolioSnapshots: [{
        id: 'snap-1', date: '2026-08-15', totalInvested: 800, currentValue: 800,
        cashBalance: 0, accruedInterest: 0,
        holdings: [{ ticker: 'EUNL', units: 10, avgCost: 80, currentPrice: 80, value: 800, returnPercent: 0 }],
      }],
      prices: { EUNL: 90 },
    });

    useInvestmentStore.getState().recomputeSnapshots();

    const snap = useInvestmentStore.getState().portfolioSnapshots[0];
    expect(snap.holdings[0].currentPrice).toBe(90);
    expect(snap.holdings[0].value).toBe(900); // 10 * 90
    expect(snap.holdings[0].returnPercent).toBeCloseTo(12.5, 1); // (90-80)/80 * 100
    expect(snap.currentValue).toBe(900);
  });
});

// ─── setAll / clearSaveError ─────────────────────────────────────────────────

describe('setAll', () => {
  it('merges partial state', () => {
    useInvestmentStore.getState().setAll({
      etfTransactions: [{ id: 'tx-1', date: '2026-08-15', ticker: 'EUNL', description: 'Test', type: 'buy', units: 5, price: 80, totalAmount: 400, accountId: 'broker-1' }],
    });

    expect(useInvestmentStore.getState().etfTransactions).toHaveLength(1);
    // Other fields unchanged
    expect(useInvestmentStore.getState().brokerAccounts).toHaveLength(1);
  });
});

describe('clearSaveError', () => {
  it('resets saveError to null', () => {
    useInvestmentStore.setState({ saveError: 'Error' });
    useInvestmentStore.getState().clearSaveError();
    expect(useInvestmentStore.getState().saveError).toBeNull();
  });
});

// ─── Price operations ────────────────────────────────────────────────────────

describe('setPrices', () => {
  it('merges new prices into existing', () => {
    useInvestmentStore.setState({ prices: { EUNL: 80 } });
    useInvestmentStore.getState().setPrices({ VWCE: 50 });

    expect(useInvestmentStore.getState().prices).toEqual({ EUNL: 80, VWCE: 50 });
  });
});

describe('setSelectedBroker', () => {
  it('updates selectedBrokerId', () => {
    useInvestmentStore.getState().setSelectedBroker('broker-1');
    expect(useInvestmentStore.getState().selectedBrokerId).toBe('broker-1');

    useInvestmentStore.getState().setSelectedBroker('all');
    expect(useInvestmentStore.getState().selectedBrokerId).toBe('all');
  });
});
