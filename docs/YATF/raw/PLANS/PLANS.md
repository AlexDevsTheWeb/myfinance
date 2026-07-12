# Car Management Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign Car page with bento grid layout, add monthly averages, maintain all charts

**Architecture:** Single-page React component in CarPage.tsx with bento grid using MUI Grid2

**Tech Stack:** React, MUI (Grid2), Recharts

---

### Task 1: Add historical averages calculation

**Files:**
- Modify: `src/pages/CarPage.tsx`

- [ ] **Step 1: Add historical stats calculation**

After `yearStats` memo, add:

```ts
// Historical averages for all years
const historicalStats = useMemo(() => {
  const yearMap = new Map<number, { total: number; months: number; avgWithData: number; avgFullYear: number }>();
  
  carMileage.forEach(m => {
    const prevYearData = carMileage.filter(p => p.year === m.year && (p.year < m.year || (p.year === m.year && p.month < m.month)));
    const prevReading = prevYearData.length > 0 
      ? prevYearData[prevYearData.length - 1].reading 
      : carInitialMileage;
    const delta = m.reading - prevReading;
    
    const existing = yearMap.get(m.year) || { total: 0, months: 0, avgWithData: 0, avgFullYear: 0 };
    yearMap.set(m.year, {
      total: existing.total + delta,
      months: existing.months + 1,
      avgWithData: 0,
      avgFullYear: 0
    });
  });
  
  yearMap.forEach((val, year) => {
    val.avgWithData = val.months > 0 ? val.total / val.months : 0;
    val.avgFullYear = val.total / 12;
  });
  
  return Array.from(yearMap.entries())
    .map(([year, val]) => ({ year, ...val }))
    .sort((a, b) => b.year - a.year);
}, [carMileage, carInitialMileage]);
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CarPage.tsx
git commit -m "feat: add historical mileage averages calculation"
```

---

### Task 2: Bento grid for Mileage tab

**Files:**
- Modify: `src/pages/CarPage.tsx` - Mileage tab section

- [ ] **Step 1: Add average stat cards to Mileage tab**

Find the Mileage tab card section and add stat cards for averages:

```tsx
{/* Average stats */}
<Grid size={{ xs: 6, md: 3 }}>
  <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
    <CardContent sx={{ p: 2 }}>
      <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Avg/Month (data)</Typography>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>{yearStats.avgKmYear.toLocaleString()} km</Typography>
    </CardContent>
  </Card>
</Grid>
<Grid size={{ xs: 6, md: 3 }}>
  <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
    <CardContent sx={{ p: 2 }}>
      <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Avg/Month (12)</Typography>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>{(yearStats.totalKmYear / 12).toLocaleString()} km</Typography>
    </CardContent>
  </Card>
</Grid>
```

- [ ] **Step 2: Restructure grid for bento layout**

Replace current Mileage tab Grid container with:

```tsx
<Grid container spacing={3}>
  {/* Total Odometer - Big card */}
  <Grid size={{ xs: 12, md: 4 }}>
    <Card sx={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', borderRadius: 4, boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SpeedIcon sx={{ mr: 1, opacity: 0.8 }} />
          <Typography variant="subtitle2" sx={{ opacity: 0.8, fontWeight: 700, textTransform: 'uppercase' }}>Total Km</Typography>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>{totalOdometer.toLocaleString('it-IT')} <small style={{ fontSize: '1rem', opacity: 0.7 }}>km</small></Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Current year total */}
  <Grid size={{ xs: 6, md: 2 }}>
    <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>{selectedYearFilter}</Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#6366f1' }}>{yearStats.totalKmYear.toLocaleString()} km</Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Avg with data */}
  <Grid size={{ xs: 6, md: 2 }}>
    <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Avg/Data</Typography>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{yearStats.avgKmYear.toLocaleString()} km</Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Avg full year */}
  <Grid size={{ xs: 6, md: 2 }}>
    <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Avg/12</Typography>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{(yearStats.totalKmYear / 12).toLocaleString()} km</Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Historical table */}
  <Grid size={{ xs: 6, md: 2 }}>
    <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700, display: 'block', mb: 1 }}>History</Typography>
        <Box sx={{ maxHeight: 80, overflow: 'auto' }}>
          {historicalStats.slice(0, 3).map(h => (
            <Box key={h.year} sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span>{h.year}</span>
              <span style={{ fontWeight: 600 }}>{h.total.toLocaleString()}</span>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  </Grid>

  {/* New Reading Form */}
  <Grid size={{ xs: 12, md: 4 }}>
    <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
        {editingId ? 'Edit Reading' : 'New Reading'}
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 4 }}>
          <TextField select fullWidth label="Month" value={selectedMonth} onChange={(e: any) => setSelectedMonth(Number(e.target.value))} variant="filled" SelectProps={{ native: true }} size="small">
            {months.map((m, i) => <option key={m} value={i + 1}>{m.substring(0, 3)}</option>)}
          </TextField>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField type="number" fullWidth label="Year" value={selectedYear} onChange={(e: any) => setSelectedYear(Number(e.target.value))} variant="filled" size="small" />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Button fullWidth variant="contained" onClick={handleSaveMileage}>{editingId ? 'Update' : 'Save'}</Button>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField type="number" fullWidth label="Odometer" value={newReading} onChange={(e: any) => setNewReading(e.target.value)} variant="filled" placeholder="e.g. 45200" />
        </Grid>
      </Grid>
    </Paper>
  </Grid>

  {/* Statistics Table */}
  <Grid size={{ xs: 12, md: 4 }}>
    <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Statistics {selectedYearFilter}</Typography>
      </Box>
      <TableContainer sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, opacity: 0.7, p: 1 }}>Month</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, opacity: 0.7, p: 1 }}>Km</TableCell>
              <TableCell align="right" sx={{ p: 1 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {yearStats.monthlyData.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ p: 1 }}>{months[row.month - 1].substring(0, 3)}</TableCell>
                <TableCell align="right" sx={{ p: 1, fontWeight: 600 }}>+{row.delta.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ p: 1 }}>
                  <IconButton size="small" onClick={() => handleEditMileage(row)}><EditIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  </Grid>

  {/* Mileage Trend Chart */}
  <Grid size={{ xs: 12, md: 4 }}>
    <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Mileage Trend</Typography>
      <Box sx={{ height: 250, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={yearStats.chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="km" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  </Grid>
</Grid>
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/CarPage.tsx
git commit -m "feat: apply bento grid layout to Mileage tab"
```

---

### Task 3: Bento grid for Tires tab

**Files:**
- Modify: `src/pages/CarPage.tsx` - Tires tab section

- [ ] **Step 1: Restructure Tires tab grid**

Replace Tires tab Grid with bento layout:

```tsx
<Grid container spacing={3}>
  {/* Summer Total */}
  <Grid size={{ xs: 6, md: 4 }}>
    <Card sx={{ background: 'rgba(245, 158, 11, 0.1)', borderRadius: 4, border: '1px solid #f59e0b' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Summer Tires</Typography>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#f59e0b' }}>{tireStats.summerTotal.toLocaleString()} km</Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Winter Total */}
  <Grid size={{ xs: 6, md: 4 }}>
    <Card sx={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: 4, border: '1px solid #3b82f6' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Winter Tires</Typography>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#3b82f6' }}>{tireStats.winterTotal.toLocaleString()} km</Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Current */}
  <Grid size={{ xs: 6, md: 4 }}>
    <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Current</Typography>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>{tireStats.currentTire === 'summer' ? 'Summer' : 'Winter'}</Typography>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>{tireStats.currentRunKm.toLocaleString()} km</Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* New Tire Change Form */}
  <Grid size={{ xs: 12, md: 6 }}>
    <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>New Tire Change</Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 4 }}>
          <TextField type="date" fullWidth label="Date" value={newTireChange.date} onChange={(e: any) => setNewTireChange({ ...newTireChange, date: e.target.value })} variant="filled" size="small" InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <TextField select fullWidth label="Type" value={newTireChange.type} onChange={(e: any) => setNewTireChange({ ...newTireChange, type: e.target.value as any })} variant="filled" size="small">
            <MenuItem value="summer">Summer</MenuItem>
            <MenuItem value="winter">Winter</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Button fullWidth variant="contained" onClick={handleSaveTireChange}>{editingTireChangeId ? 'Update' : 'Save'}</Button>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField type="number" fullWidth label="Odometer" value={newTireChange.odometer} onChange={(e: any) => setNewTireChange({ ...newTireChange, odometer: e.target.value })} variant="filled" />
        </Grid>
      </Grid>
    </Paper>
  </Grid>

  {/* History Table */}
  <Grid size={{ xs: 12, md: 6 }}>
    <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>History</Typography>
      <TableContainer sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, opacity: 0.7, p: 1 }}>Date</TableCell>
              <TableCell sx={{ p: 1 }}>Type</TableCell>
              <TableCell align="right" sx={{ p: 1 }}>Km</TableCell>
              <TableCell align="right" sx={{ p: 1 }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tireStats.history.map((row) => (
              <TableRow key={row.id}>
                <TableCell sx={{ p: 1 }}>{dayjs(row.date).format('DD/MM')}</TableCell>
                <TableCell sx={{ p: 1, color: row.type === 'summer' ? '#f59e0b' : '#3b82f6' }}>{row.type === 'summer' ? 'Summer' : 'Winter'}</TableCell>
                <TableCell align="right" sx={{ p: 1, fontWeight: 600 }}>{row.runKm.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ p: 1 }}>
                  <IconButton size="small" onClick={() => handleEditTireChange(row)}><EditIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  </Grid>

  {/* Tire Usage Chart */}
  <Grid size={{ xs: 12, md: 12 }}>
    <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Tire Usage</Typography>
      <Box sx={{ height: 250, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={tireStats.history.slice(0, 10).map((t, i) => ({ name: `${i + 1}`, km: t.runKm }))}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="km" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  </Grid>
</Grid>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CarPage.tsx
git commit -m "feat: apply bento grid layout to Tires tab"
```

---

### Task 4: Bento grid for Fuel tab

**Files:**
- Modify: `src/pages/CarPage.tsx` - Fuel tab section

- [ ] **Step 1: Restructure Fuel tab grid**

Replace Fuel tab Grid with bento layout:

```tsx
<Grid container spacing={3}>
  {/* Total Spent */}
  <Grid size={{ xs: 6, md: 4 }}>
    <Card sx={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: 4 }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 700 }}>Total Spent</Typography>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>{costStats.totalCostYear.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Efficiency */}
  <Grid size={{ xs: 6, md: 4 }}>
    <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Efficiency</Typography>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#10b981' }}>{costStats.avgEfficiencyYear.toFixed(3)} €/km</Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Total Km */}
  <Grid size={{ xs: 6, md: 4 }}>
    <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="caption" sx={{ opacity: 0.6, fontWeight: 700 }}>Total Km</Typography>
        <Typography variant="h5" sx={{ fontWeight: 900 }}>{costStats.totalKmYear.toLocaleString()}</Typography>
      </CardContent>
    </Card>
  </Grid>

  {/* Monthly Details Table */}
  <Grid size={{ xs: 12, md: 6 }}>
    <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Monthly Details</Typography>
      <TableContainer sx={{ background: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, opacity: 0.7, p: 1 }}>Month</TableCell>
              <TableCell align="right" sx={{ p: 1 }}>Km</TableCell>
              <TableCell align="right" sx={{ p: 1 }}>Cost</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {costStats.monthlyEfficiency.map((row) => (
              <TableRow key={`${row.year}-${row.month}`}>
                <TableCell sx={{ p: 1, fontWeight: 600 }}>{months[row.month - 1].substring(0, 3)}</TableCell>
                <TableCell align="right" sx={{ p: 1 }}>{row.kmDriven.toLocaleString()}</TableCell>
                <TableCell align="right" sx={{ p: 1 }}>{row.fuelCost.toLocaleString('it-IT', { style: 'currency', currency: 'EUR' })}</TableCell>
              </TableRow>
            ))}
            {costStats.monthlyEfficiency.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 2, opacity: 0.5 }}>No data.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  </Grid>

  {/* Fuel Efficiency Trend Chart */}
  <Grid size={{ xs: 12, md: 6 }}>
    <Paper sx={{ p: 3, borderRadius: 4, background: 'rgba(30, 41, 59, 0.3)', border: '1px solid rgba(255,255,255,0.05)', height: '100%' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Fuel Efficiency Trend</Typography>
      <Box sx={{ height: 250, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={costStats.chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  </Grid>
</Grid>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/CarPage.tsx
git commit -m "feat: apply bento grid layout to Fuel tab"
```

---

### Task 5: Test build

**Files:**
- None (verification)

- [ ] **Step 1: Run build**

```bash
npm run build
```

- [ ] **Step 2: Commit remaining changes**

```bash
git add .
git commit -m "feat: complete car management redesign"
```

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Add historical averages calculation |
| 2 | Bento grid for Mileage tab |
| 3 | Bento grid for Tires tab |
| 4 | Bento grid for Fuel tab |
| 5 | Test build |

**Plan complete.**