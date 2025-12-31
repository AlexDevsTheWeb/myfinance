import { Summarize } from '@mui/icons-material';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography
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
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Summarize sx={{ fontSize: 40, color: 'primary.main' }} />
            Financial Analysis
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.6 }}>
            Overall performance, income, and expense breakdown for the year.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
      </Box>

      <FinancialTrendChart selectedYear={selectedYear} />

      <AnalysisTables selectedYear={selectedYear} />
    </Box>
  );
};

export default AnalysisPage;
