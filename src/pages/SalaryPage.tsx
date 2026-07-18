import { BarChart as BarChartIcon, TrendingUp } from '@mui/icons-material';
import { Box, Card, CardContent, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { axisClasses } from '@mui/x-charts';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFinanceStore } from '../store/useFinanceStore';

interface MonthlySalaryData {
  monthName: string;
  [key: number]: number;
  [key: string]: string | number;
}

const SalaryPage: React.FC = () => {
  const { transactions } = useFinanceStore();
  const { t } = useTranslation();
  const theme = useTheme();

  const salaryData = useMemo(() => {
    return transactions
      .filter((t) => t.category === 'Salario')
      .map((s) => ({
        id: s.id,
        date: s.date,
        amount: s.amount,
        description: s.description,
        year: dayjs(s.date).year(),
        month: dayjs(s.date).month(),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  const availableYears = useMemo(() => {
    return Array.from(new Set(salaryData.map(d => d.year))).sort((a, b) => b - a);
  }, [salaryData]);

  const trendChartData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i,
      monthName: dayjs().month(i).format('MMM'),
    }));

    return months.map(m => {
      const row: MonthlySalaryData = { monthName: m.monthName };
      availableYears.forEach(year => {
        const monthEntries = salaryData.filter(d => d.year === year && d.month === m.month);
        const total = monthEntries.reduce((sum, d) => sum + d.amount, 0);

        if (total > 0) {
          row[year] = total;
          row[`${year}_details`] = monthEntries.map(d => `${d.description}: €${d.amount.toLocaleString()}`).join(', ');
        }
      });
      return row;
    });
  }, [salaryData, availableYears]);

  const yoyData = useMemo(() => {
    const salaries = transactions.filter(
      (t) => t.category === 'Salario'
    );

    const monthlyGroups: { [key: string]: number } = {};
    salaries.forEach((s) => {
      const monthYear = dayjs(s.date).format('YYYY-MM');
      monthlyGroups[monthYear] = (monthlyGroups[monthYear] || 0) + s.amount;
    });

    const groupedSalaryData = Object.entries(monthlyGroups)
      .map(([date, amount]) => ({
        date,
        amount,
        year: dayjs(date).year(),
        month: dayjs(date).month(),
      }));

    const years = Array.from(new Set(groupedSalaryData.map(d => d.year))).sort((a, b) => b - a);
    const months = Array.from({ length: 12 }, (_, i) => i);

    return months.map(month => {
      const monthName = dayjs().month(month).format('MMMM');
      const yearValues: { [key: number]: number } = {};

      years.forEach(year => {
        const entry = groupedSalaryData.find(d => d.year === year && d.month === month);
        yearValues[year] = entry ? entry.amount : 0;
      });

      return {
        month: monthName,
        monthIdx: month,
        yearValues,
      };
    }).filter(m => Object.values(m.yearValues).some(v => v > 0));
  }, [transactions]);

  const COLORS = [theme.palette.primary.main, theme.palette.success.main, theme.palette.warning.main, theme.palette.error.main, theme.palette.primary.main, theme.palette.secondary.main];

  const months = trendChartData.map(d => d.monthName);
  const series = availableYears.map((year, index) => ({
    data: trendChartData.map(d => (d[year] as number) || 0),
    label: year.toString(),
    color: COLORS[index % COLORS.length],
    showMark: true,
    valueFormatter: (v: number | null) => v === null ? '' : `€ ${v.toLocaleString()}`,
  }));

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />
          Salary Analysis
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.6 }}>
          Track your income trends and year-over-year performance.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* YoY Comparison Table - Left Column */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>{t('salary.comparison')}</Typography>
              <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{t('car.month')}</TableCell>
                      {availableYears.map(year => (
                        <TableCell key={year} align="right" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>{year}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {yoyData.map((row) => (
                      <TableRow key={row.month} sx={{ '&:hover': { background: 'rgba(255,255,255,0.02)' } }}>
                        <TableCell sx={{ fontWeight: 600, verticalAlign: 'top', pt: 2 }}>{row.month}</TableCell>
                        {availableYears.map((year, yIdx) => {
                          const amount = row.yearValues[year] || 0;
                          const nextYear = availableYears[yIdx + 1];
                          const prevAmount = nextYear ? (row.yearValues[nextYear] || 0) : 0;

                          const hasPrev = nextYear && prevAmount > 0;
                          const diff = hasPrev ? ((amount - prevAmount) / prevAmount) * 100 : 0;
                          const absDiff = amount - prevAmount;
                          const isIncrease = amount >= prevAmount;

                          return (
                            <TableCell key={year} align="right" sx={{ verticalAlign: 'top', py: 1.5 }}>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                € {amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                              </Typography>

                              {hasPrev && (
                                <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', display: 'block', color: isIncrease ? 'success.main' : 'error.main', opacity: 0.9 }}>
                                  {isIncrease ? '+' : ''}{diff.toFixed(1)}% | {absDiff >= 0 ? '+' : ''}€ {absDiff.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                </Typography>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Monthly Trend Chart - Right Column */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                <BarChartIcon /> Monthly Salary Trend
              </Typography>
              <Box sx={{ height: 400, mt: 2 }}>
                <LineChart
                  series={series}
                  xAxis={[{ scaleType: 'band', data: months, disableLine: true, disableTicks: true }]}
                  yAxis={[{ disableLine: true, disableTicks: true }]}
                  grid={{ vertical: false, horizontal: true }}
                  height={400}
                  margin={{ top: 10, right: 10, bottom: 30, left: 50 }}
                  sx={{
                    [`.${axisClasses.tickLabel}`]: {
                      fill: 'rgba(255,255,255,0.5)',
                      fontSize: 12,
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalaryPage;
