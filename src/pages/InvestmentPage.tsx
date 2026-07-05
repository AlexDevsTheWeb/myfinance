/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountBalance, Add, Refresh, TrendingUp } from '@mui/icons-material';
import { Badge, Box, Button, Grid, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';
import AllocationDonutChart from '../components/investment/AllocationDonutChart';
import BrokerSelect from '../components/investment/BrokerSelect';
import CashAdjustmentDialog from '../components/investment/CashAdjustmentDialog';
import CashInterestCard from '../components/investment/CashInterestCard';
import DividendBadge from '../components/investment/DividendBadge';
import DividendDialog from '../components/investment/DividendDialog';
import EtfTransactionModal from '../components/investment/EtfTransactionModal';
import HoldingsTable from '../components/investment/HoldingsTable';
import PacConfirmationDialog from '../components/investment/PacConfirmationDialog';
import PortfolioLineChart from '../components/investment/PortfolioLineChart';
import PortfolioStats from '../components/investment/PortfolioStats';
import TaxPocketWidget from '../components/investment/TaxPocketWidget';
import { usePacAutomation } from '../hooks/usePacAutomation';
import { usePortfolio } from '../analytics/hooks/usePortfolio';
import { useMarketData } from '../hooks/useMarketData';
import { useInvestmentStore } from '../store/useInvestmentStore';
import type { IETFTransaction, IInvestmentHolding } from '../store/types';

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const InvestmentPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [etfModalOpen, setEtfModalOpen] = useState(false);
  const [cashAdjustmentOpen, setCashAdjustmentOpen] = useState(false);
  const [dividendOpen, setDividendOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('1Y');
  const [editingTransaction, setEditingTransaction] = useState<IETFTransaction | null>(null);
  const [pacDialogOpen, setPacDialogOpen] = useState(false);

  usePacAutomation(); // Initialize PAC check on mount

  const { brokerAccounts, selectedBrokerId, setSelectedBroker, etfTransactions, pendingPacTransaction } = useInvestmentStore();
  const portfolio = usePortfolio();
  const { refreshPrices, isUpdating } = useMarketData();

  const handleEdit = (holding: IInvestmentHolding) => {
    const tx = etfTransactions
      .filter(t => t.ticker === holding.ticker)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (tx) {
      setEditingTransaction(tx);
      setEtfModalOpen(true);
    }
  };

  const handleDelete = (holding: IInvestmentHolding) => {
    const tx = etfTransactions
      .filter(t => t.ticker === holding.ticker)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (tx) {
      // Delete single latest transaction for this ticker
      window.confirm('Delete this transaction? Units and PMC will be recalculated.')
        ? useInvestmentStore.getState().deleteEtfTransaction(tx.id)
        : null;
    }
  };

  const handleCloseModal = () => {
    setEtfModalOpen(false);
    setEditingTransaction(null);
  };

  const chartData = portfolio.chartData;
  const donutData = portfolio.holdings.map(h => ({
    name: h.ticker,
    value: h.value,
  }));

  return (
    <Box sx={{ pb: 6 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountBalance sx={{ fontSize: 40, color: 'primary.main' }} />
            Investments
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.6 }}>
            Track ETF portfolio and broker cash.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <BrokerSelect
            brokers={brokerAccounts}
            selected={selectedBrokerId}
            onChange={setSelectedBroker}
          />
          {pendingPacTransaction && (
            <Badge badgeContent="!" color="warning" onClick={() => setPacDialogOpen(true)} sx={{ cursor: 'pointer' }}>
              <Button variant="outlined" color="warning">
                PAC Pending
              </Button>
            </Badge>
          )}
          <Button variant="outlined" startIcon={<Refresh />} onClick={refreshPrices} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Refresh Prices'}
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 3 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} textColor="inherit" indicatorColor="primary">
          <Tab label="Cash Balance" icon={<AccountBalance />} iconPosition="start" />
          <Tab label="Invested Capital" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3 }}>
            <CashInterestCard
              cashBalance={portfolio.cashBalance}
              interestRate={portfolio.interestRate}
              accruedInterest={portfolio.accruedInterest}
              brokerName={portfolio.brokerName}
            />
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" startIcon={<Add />} onClick={() => setCashAdjustmentOpen(true)} size="small">
                Cash Adjustment
              </Button>
              <Button variant="outlined" startIcon={<Add />} onClick={() => setDividendOpen(true)} size="small">
                Add Dividend
              </Button>
              <DividendBadge totalDividends={portfolio.monthlyDividends} />
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <PortfolioLineChart data={chartData} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
            <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', mt: 1, textAlign: 'right' }}>
              Prices delayed up to 15 min
            </Typography>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Portfolio Overview</Typography>
          <Button variant="contained" onClick={() => setEtfModalOpen(true)}>
            Add Transaction
          </Button>
        </Box>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <PortfolioStats
              totalInvested={portfolio.totalInvested}
              currentValue={portfolio.currentValue}
              totalReturn={portfolio.totalReturn}
              totalReturnPercent={portfolio.totalReturnPercent}
              isPositive={portfolio.isPositive}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <HoldingsTable holdings={portfolio.holdings} onEdit={handleEdit} onDelete={handleDelete} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <AllocationDonutChart data={donutData} title="Allocation" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <PortfolioLineChart data={chartData} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TaxPocketWidget />
          </Grid>
        </Grid>
      </TabPanel>

      <EtfTransactionModal open={etfModalOpen} onClose={handleCloseModal} editTransaction={editingTransaction} defaultBrokerId={selectedBrokerId === 'all' ? undefined : selectedBrokerId} />
      <PacConfirmationDialog open={pacDialogOpen} onClose={() => setPacDialogOpen(false)} />
      <CashAdjustmentDialog open={cashAdjustmentOpen} onClose={() => setCashAdjustmentOpen(false)} defaultBrokerId={selectedBrokerId === 'all' ? undefined : selectedBrokerId} />
      <DividendDialog open={dividendOpen} onClose={() => setDividendOpen(false)} defaultBrokerId={selectedBrokerId === 'all' ? undefined : selectedBrokerId} />
    </Box>
  );
};

export default InvestmentPage;
