import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { resolveBillPreset } from '../components/utilities/utilities.utils';
import { useFinanceStore } from '../store/useFinanceStore';
import { useUiStore } from '../store/useUiStore';

/**
 * The app's single "new transaction" action.
 *
 * Shared by the desktop TopBar CTA and the mobile header action so both open the
 * same global drawer. On `/utilities` it seeds the bill category and expands the
 * utility block; everywhere else it opens a blank expense.
 */
export function useNewTransaction(): () => void {
  const categories = useFinanceStore((state) => state.categories);
  const openTransactionDrawer = useUiStore((state) => state.openTransactionDrawer);
  const { pathname } = useLocation();
  const currentPath = pathname.replace(/\/$/, '');

  return useCallback(() => {
    if (currentPath === '/utilities') {
      const preset = resolveBillPreset(categories, 'all');
      openTransactionDrawer('expense', null, { ...preset, utility: true });
      return;
    }
    openTransactionDrawer('expense');
  }, [currentPath, categories, openTransactionDrawer]);
}
