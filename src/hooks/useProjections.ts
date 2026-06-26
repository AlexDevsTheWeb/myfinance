import { useEffect, useMemo, useState } from 'react';
import { generateFinancialProjection } from '../lib/compoundInterestUtils';
import type { IMonthlySnapshot, IProjectionInput } from '../store/types';

const DEFAULT_INPUT: IProjectionInput = {
  years: 20,
  initialLumpSum: 0,
  annualInflow: 0,
  monthlyPac: 200,
  etfAnnualReturn: 0.07,
  cashAnnualRate: 0.02,
};

export interface ProjectionSummary {
  finalCapital: number;
  totalInterests: number;
  estimatedTaxes: number;
}

export interface UseProjectionsReturn {
  input: IProjectionInput;
  snapshots: IMonthlySnapshot[];
  summary: ProjectionSummary | null;
  chartData: { label: string; netWorth: number; totalInvested: number }[];
  setParam: (key: keyof IProjectionInput, value: number) => void;
  resetToDefaults: () => void;
}

export function useProjections(): UseProjectionsReturn {
  const [input, setInput] = useState<IProjectionInput>(DEFAULT_INPUT);

  useEffect(() => {
    const prefetch = async () => {
      try {
        const { useInvestmentStore } = await import('../store/useInvestmentStore');
        const brokerConfig = useInvestmentStore.getState().brokerConfig;
        if (brokerConfig) {
          setInput(prev => ({
            ...prev,
            monthlyPac: brokerConfig.monthlyPacAmount > 0 ? brokerConfig.monthlyPacAmount : prev.monthlyPac,
            initialLumpSum: brokerConfig.lumpSumAmount > 0 ? brokerConfig.lumpSumAmount : prev.initialLumpSum,
            cashAnnualRate: brokerConfig.interestRate > 0 ? brokerConfig.interestRate / 100 : prev.cashAnnualRate,
          }));
        }
      } catch {
        // Investment store not available — use defaults
      }
    };
    prefetch();
  }, []);

  const snapshots = useMemo(() => generateFinancialProjection(input), [input]);

  const chartData = useMemo(() => {
    if (snapshots.length === 0) return [];
    const yearlyData = new Map<number, { netWorth: number; totalInvested: number }>();
    for (const snap of snapshots) {
      yearlyData.set(snap.year, {
        netWorth: snap.netWorth,
        totalInvested: snap.totalInvested,
      });
    }
    return Array.from(yearlyData.entries()).map(([year, values]) => ({
      label: `Year ${year}`,
      ...values,
    }));
  }, [snapshots]);

  const summary = useMemo(() => {
    const last = snapshots[snapshots.length - 1];
    if (!last) return null;
    const interests = last.netWorth - last.totalInvested;
    return {
      finalCapital: last.netWorth,
      totalInterests: interests,
      estimatedTaxes: Math.max(0, interests * 0.26),
    };
  }, [snapshots]);

  const setParam = (key: keyof IProjectionInput, value: number) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setInput(DEFAULT_INPUT);
  };

  return { input, snapshots, summary, chartData, setParam, resetToDefaults };
}
