import { Box, Grid, Typography } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
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
    years.add(dayjs().year());
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />
          Financial Analysis
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.6 }}>
          Deep dive into your financial performance.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <YearSelector
              availableYears={availableYears}
              selectedYear={selectedYear}
              onYearChange={setSelectedYear}
            />
          </Box>
          <AnalysisTables selectedYear={selectedYear} />
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <FinancialTrendChart selectedYear={selectedYear} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalysisPage;
