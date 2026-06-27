import { useEffect, useRef } from 'react';
import dayjs from 'dayjs';
import { useAuthStore } from '../store/useAuthStore';
import { useInvestmentStore } from '../store/useInvestmentStore';

const PAC_DAY = 1; // Default: 1st of month (configurable per broker)

/**
 * PAC Automation Initialization Hook (D-04)
 *
 * On app init, checks each broker account:
 * 1. Does the broker have monthlyPacAmount > 0?
 * 2. Has PAC already been generated this month for this broker?
 * 3. Has the configured PAC day passed this month?
 *
 * If all conditions met, generates a pending PAC transaction via the store.
 * Uses useRef guard to prevent duplicate generation on re-render/HMR (Pitfall 2).
 */
export function usePacAutomation() {
  const { user } = useAuthStore();
  const hasChecked = useRef(false);

  useEffect(() => {
    if (!user) {
      hasChecked.current = false;
      return;
    }

    // Prevent duplicate runs (Pitfall 2: HMR guard)
    if (hasChecked.current) return;
    hasChecked.current = true;

    const store = useInvestmentStore.getState();
    const { brokerAccounts, pendingPacTransaction, addPendingPacTransaction } = store;

    // Only run if no pending PAC already exists
    if (pendingPacTransaction) return;

    const today = dayjs();
    const currentMonthKey = today.format('YYYY-MM');

    for (const broker of brokerAccounts) {
      // Skip brokers without PAC configured
      if (!broker.monthlyPacAmount || broker.monthlyPacAmount <= 0) continue;

      const storageKey = `pac_last_${broker.id}`;

      // Check localStorage for per-broker tracking
      const lastPacMonth = localStorage.getItem(storageKey);
      if (lastPacMonth === currentMonthKey) continue;

      // Also check store-level lastPacGenerationDate (backup check)
      if (store.lastPacGenerationDate === currentMonthKey) continue;

      // Default PAC day is 1st of month
      const pacDay = PAC_DAY; // Future: could be per-broker config

      if (today.date() >= pacDay) {
        addPendingPacTransaction({
          brokerId: broker.id,
          amount: broker.monthlyPacAmount,
          date: today.format('YYYY-MM-DD'),
          status: 'pending',
        });

        // Mark this month as generated (persist across refreshes)
        localStorage.setItem(storageKey, currentMonthKey);
        break; // Only generate one pending PAC at a time
      }
    }
  }, [user]);
}
