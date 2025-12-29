/* eslint-disable @typescript-eslint/no-explicit-any */
import { type DocumentData, type FirestoreDataConverter, QueryDocumentSnapshot, type SnapshotOptions } from 'firebase/firestore';
import { type Category, type RecurringTransaction, type Transaction } from '../store/useFinanceStore';

interface UserDoc {
  transactions: Transaction[];
  initialBalance: number;
  categories: Category[];
  incomeCategories: Category[];
  recurringTransactions: RecurringTransaction[];
  balanceStartDate: string;
}

export const userDocConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore: (userDoc: UserDoc): DocumentData => {
    return {
      transactions: userDoc.transactions.map(t => ({
        id: t.id,
        date: t.date,
        description: t.description,
        category: t.category,
        subcategory: t.subcategory,
        amount: t.amount,
        type: t.type,
        recurringLinkId: t.recurringLinkId ?? null,
      })),
      initialBalance: userDoc.initialBalance,
      categories: userDoc.categories,
      incomeCategories: userDoc.incomeCategories,
      recurringTransactions: userDoc.recurringTransactions.map(r => ({
        id: r.id,
        description: r.description,
        category: r.category,
        subcategory: r.subcategory,
        amount: r.amount,
        type: r.type,
        dayOfMonth: r.dayOfMonth,
        startDate: r.startDate,
        endDate: r.endDate ?? null,
      })),
      balanceStartDate: userDoc.balanceStartDate || '2026-01-01',
    };
  },
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): UserDoc => {
    const data = snapshot.data(options);

    // Basic validation and type casting
    const transactions: Transaction[] = Array.isArray(data.transactions) ? data.transactions.map((t: any) => ({
      id: t.id ?? '',
      date: t.date ?? '',
      description: t.description ?? '',
      category: t.category ?? '',
      subcategory: t.subcategory ?? '',
      amount: typeof t.amount === 'number' ? t.amount : 0,
      type: t.type === 'income' || t.type === 'expense' ? t.type : 'expense',
      recurringLinkId: t.recurringLinkId,
    })) : [];

    const initialBalance: number = typeof data.initialBalance === 'number' ? data.initialBalance : 0;

    const categories: Category[] = Array.isArray(data.categories) ? data.categories.map((c: any) => ({
      name: c.name ?? '',
      subcategories: Array.isArray(c.subcategories) ? c.subcategories.filter((sc: any) => typeof sc === 'string') : [],
    })) : [];

    const incomeCategories: Category[] = Array.isArray(data.incomeCategories) ? data.incomeCategories.map((c: any) => ({
      name: c.name ?? '',
      subcategories: Array.isArray(c.subcategories) ? c.subcategories.filter((sc: any) => typeof sc === 'string') : [],
    })) : [];

    const recurringTransactions: RecurringTransaction[] = Array.isArray(data.recurringTransactions) ? data.recurringTransactions.map((r: any) => ({
      id: r.id ?? '',
      description: r.description ?? '',
      category: r.category ?? '',
      subcategory: r.subcategory ?? '',
      amount: typeof r.amount === 'number' ? r.amount : 0,
      type: r.type === 'income' || r.type === 'expense' ? r.type : 'expense',
      dayOfMonth: typeof r.dayOfMonth === 'number' ? r.dayOfMonth : 1,
      startDate: r.startDate ?? '',
      endDate: r.endDate,
    })) : [];

    const balanceStartDate: string = data.balanceStartDate || '2026-01-01';

    return {
      transactions,
      initialBalance,
      categories,
      incomeCategories,
      recurringTransactions,
      balanceStartDate,
    };
  }
};
