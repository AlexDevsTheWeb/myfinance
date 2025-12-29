import dayjs from 'dayjs';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useEffect } from 'react';
import { userDocConverter } from '../lib/converters';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useFinanceStore } from '../store/useFinanceStore';

export const useSyncFinance = () => {
  const { user } = useAuthStore();
  const {
    transactions, setTransactions,
    initialBalance, setInitialBalance,
    categories, setCategories,
    incomeCategories, setIncomeCategories,
    recurringTransactions, setRecurringTransactions,
    balanceStartDate, setBalanceStartDate,
  } = useFinanceStore();

  // Load data from Firestore on user change
  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'users', user.uid).withConverter(userDocConverter);

    const unsub = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.transactions) setTransactions(data.transactions);
        if (data.initialBalance !== undefined) setInitialBalance(data.initialBalance);
        if (data.categories) setCategories(data.categories);
        if (data.incomeCategories) setIncomeCategories(data.incomeCategories);
        if (data.recurringTransactions) setRecurringTransactions(data.recurringTransactions);
        if (data.balanceStartDate) setBalanceStartDate(data.balanceStartDate);
      }
    });

    return () => unsub();
  }, [user, setTransactions, setInitialBalance, setCategories, setIncomeCategories, setRecurringTransactions, setBalanceStartDate]);

  // Materialize recurring transactions
  useEffect(() => {
    if (!user || recurringTransactions.length === 0) return;

    const now = dayjs();
    let updated = false;
    const newTransactions = [...transactions];

    recurringTransactions.forEach((rec) => {
      const start = dayjs(rec.startDate);
      let current = start;

      // Iterate through months from start date until now
      while (current.isBefore(now, 'day') || current.isSame(now, 'day')) {
        // The transaction happens on rec.dayOfMonth
        // We need to adjust 'current' to that day of the month
        let targetDate = current.date(rec.dayOfMonth);

        // Handle cases where the month has fewer days (e.g. 31st of Feb -> 28th)
        if (targetDate.month() !== current.month()) {
          targetDate = current.endOf('month');
        }

        // If targetDate is after 'now', we stop for this recurring item
        if (targetDate.isAfter(now, 'day')) break;

        // If targetDate is after the endDate, we stop for this recurring item
        if (rec.endDate && targetDate.isAfter(dayjs(rec.endDate), 'day')) break;

        // If targetDate is before the startDate, we skip (shouldn't happen with our loop but good for safety)
        if (targetDate.isBefore(start, 'day')) {
          current = current.add(1, 'month');
          continue;
        }

        const dateStr = targetDate.format('YYYY-MM-DD');

        // Check if this instance already exists
        const exists = transactions.some(t => t.recurringLinkId === rec.id && t.date === dateStr);

        if (!exists) {
          newTransactions.push({
            id: crypto.randomUUID(),
            date: dateStr,
            description: rec.description,
            category: rec.category,
            subcategory: rec.subcategory,
            amount: rec.amount,
            type: rec.type,
            recurringLinkId: rec.id,
          });
          updated = true;
        }

        current = current.add(1, 'month');
      }
    });

    if (updated) {
      // Sort transactions by date (descending) before saving
      newTransactions.sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
      setTransactions(newTransactions);
    }
  }, [user, recurringTransactions, transactions, setTransactions]);

  // Save data to Firestore on local change
  useEffect(() => {
    if (!user) return;

    const saveData = async () => {
      const docRef = doc(db, 'users', user.uid).withConverter(userDocConverter);
      await setDoc(docRef, {
        transactions,
        initialBalance,
        categories,
        incomeCategories,
        recurringTransactions,
        balanceStartDate,
      }, { merge: true });
    };

    saveData();
  }, [user, transactions, initialBalance, categories, incomeCategories, recurringTransactions, balanceStartDate]);
};
