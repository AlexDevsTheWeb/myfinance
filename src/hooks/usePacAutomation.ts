import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { useInvestmentStore } from '../store/useInvestmentStore';
import type { PacState } from '../lib/converters';

const PAC_DAY = 1;

function migratePacStateFromLocalStorage(): Record<string, string> | null {
  const migrated: Record<string, string> = {};
  let found = false;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('pac_last_')) {
      const brokerId = key.replace('pac_last_', '');
      migrated[brokerId] = localStorage.getItem(key) ?? '';
      found = true;
    }
  }
  return found ? migrated : null;
}

export function usePacAutomation() {
  const { user } = useAuthStore();
  const hasChecked = useRef(false);
  const hasMigrated = useRef(false);

  useEffect(() => {
    if (!user) {
      hasChecked.current = false;
      return;
    }

    if (hasChecked.current) return;
    hasChecked.current = true;

    const store = useInvestmentStore.getState();
    const { brokerAccounts, pacState, addPendingPacTransaction } = store;

    if (!hasMigrated.current && Object.keys(pacState.perBrokerLastGeneration).length === 0) {
      const localStorageData = migratePacStateFromLocalStorage();
      if (localStorageData) {
        hasMigrated.current = true;
        const mergedPacState: PacState = {
          ...pacState,
          perBrokerLastGeneration: localStorageData,
        };
        const docRef = doc(db, 'users', user.uid);
        updateDoc(docRef, { pacState: mergedPacState }).catch(() => {});
        useInvestmentStore.getState().setAll({ pacState: mergedPacState });
      }
    }

    if (pacState.pendingTransaction) return;

    const today = dayjs();
    const currentMonthKey = today.format('YYYY-MM');

    for (const broker of brokerAccounts) {
      if (!broker.monthlyPacAmount || broker.monthlyPacAmount <= 0) continue;

      const lastPacMonth = pacState.perBrokerLastGeneration[broker.id];
      if (lastPacMonth === currentMonthKey) continue;

      if (pacState.lastGenerationDate === currentMonthKey) continue;

      if (today.date() >= PAC_DAY) {
        addPendingPacTransaction({
          brokerId: broker.id,
          amount: broker.monthlyPacAmount,
          date: today.format('YYYY-MM-DD'),
          status: 'pending',
        });

        const userId = useAuthStore.getState().user?.uid;
        if (userId) {
          const docRef = doc(db, 'users', userId);
          const updatedPacState = {
            ...useInvestmentStore.getState().pacState,
            perBrokerLastGeneration: {
              ...useInvestmentStore.getState().pacState.perBrokerLastGeneration,
              [broker.id]: currentMonthKey,
            },
          };
          updateDoc(docRef, { pacState: updatedPacState }).catch(() => {});
        }
        break;
      }
    }
  }, [user]);
}
