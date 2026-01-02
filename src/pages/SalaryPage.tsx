import { ArrowDownward, ArrowUpward, BarChart as BarChartIcon, TrendingUp } from '@mui/icons-material';
import { Box, Card, CardContent, Chip, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useFinanceStore } from '../store/useFinanceStore';

const SalaryPage: React.FC = () => {
  const { transactions } = useFinanceStore();

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
      const row: any = { monthName: m.monthName };
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

    // Group by Month/Year for YoY comparison
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
    }).filter(m => Object.values(m.yearValues).some(v => v > 0)); // Only show months with data
  }, [transactions]);

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

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

      <Grid container spacing={4}>
        {/* Monthly Trend Chart */}
        <Grid size={{ xs: 12 }}>
          <Paper>
            <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChartIcon /> Monthly Salary Trend
                </Typography>
                <Box sx={{ height: 350, mt: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="monthName"
                        stroke="rgba(255,255,255,0.5)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="rgba(255,255,255,0.5)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `€${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#1e293b',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        itemStyle={{ color: '#fff' }}
                        formatter={(value: number, name: any, props: any) => {
                          const year = name;
                          const details = props.payload[`${year}_details`];
                          return [
                            <Box key={year}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>€ {value.toLocaleString()}</Typography>
                              <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>{details}</Typography>
                            </Box>,
                            `Year ${year}`
                          ];
                        }}
                      />
                      <Legend iconType="circle" />
                      {availableYears.map((year, index) => (
                        <Line
                          key={year}
                          type="monotone"
                          dataKey={year}
                          name={year.toString()}
                          stroke={COLORS[index % COLORS.length]}
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2, fill: '#1e293b' }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Paper>
        </Grid>

        {/* YoY Comparison Table */}
        <Grid size={{ xs: 12 }}>
          <Paper>
            <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>Year over Year Comparison</Typography>
                <TableContainer component={Paper} sx={{ background: 'transparent', boxShadow: 'none' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Month</TableCell>
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
                              <TableCell key={year} align="right" sx={{ verticalAlign: 'top' }}>
                                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                  € {amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                </Typography>

                                {hasPrev && (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', mt: 1, gap: 0.5 }}>
                                    <Chip
                                      size="small"
                                      icon={isIncrease ? <ArrowUpward sx={{ fontSize: '0.7rem !important' }} /> : <ArrowDownward sx={{ fontSize: '0.7rem !important' }} />}
                                      label={`${isIncrease ? '+' : ''}${diff.toFixed(1)}%`}
                                      color={isIncrease ? 'success' : 'error'}
                                      variant="outlined"
                                      sx={{
                                        height: 20,
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        '& .MuiChip-label': { px: 1 },
                                        '& .MuiChip-icon': { ml: 0.5, mr: -0.5 }
                                      }}
                                    />
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: isIncrease ? 'success.main' : 'error.main', opacity: 0.8, fontSize: '0.65rem' }}>
                                      {absDiff >= 0 ? '+' : ''}€ {absDiff.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                                    </Typography>
                                  </Box>
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
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SalaryPage;
