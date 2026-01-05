import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo, useState } from 'react';
import AnalysisTables from '../components/analysis/AnalysisTables';
import FinancialTrendChart from '../components/analysis/FinancialTrendChart';

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
        <FormControl variant="filled" size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: 'rgba(255,255,255,0.6)' }}>Year</InputLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            sx={{
              color: 'white',
              '&:before': { borderColor: 'rgba(255,255,255,0.1)' },
              '&:after': { borderColor: 'primary.main' }
            }}
          >
            {availableYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <FinancialTrendChart selectedYear={selectedYear} />

      <AnalysisTables selectedYear={selectedYear} />
    </Box>
  );
};

export default AnalysisPage;
