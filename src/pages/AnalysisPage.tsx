import {
  Box
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import AnalysisTables from '../components/analysis/AnalysisTables';
import FinancialTrendChart from '../components/analysis/FinancialTrendChart';
import { YearSelector } from '../components/common/YearSelector.component';

import { useFinanceStore } from '../store/useFinanceStore';

const AnalysisPage: React.FC = () => {
  const { transactions } = useFinanceStore();
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  const availableYears = useMemo(() => {
    const years = new Set(transactions.map((t) => dayjs(t.date).year()));
    years.add(dayjs().year()); // Always include current year
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  return (
    <Box sx={{ pb: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <YearSelector
          availableYears={availableYears}
          selectedYear={selectedYear}
          onYearChange={setSelectedYear}
        />
      </Box>

      <FinancialTrendChart selectedYear={selectedYear} />

      <AnalysisTables selectedYear={selectedYear} />
    </Box>
  );
};

export default AnalysisPage;
