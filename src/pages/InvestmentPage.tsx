/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountBalance, Refresh, Settings, TrendingUp } from '@mui/icons-material';
import { Box, Button, Grid, Tab, Tabs, Typography } from '@mui/material';
import React, { useState } from 'react';
import AllocationDonutChart from '../components/investment/AllocationDonutChart';
import BrokerSelect from '../components/investment/BrokerSelect';
import BrokerSettingsModal from '../components/investment/BrokerSettingsModal';
import CashInterestCard from '../components/investment/CashInterestCard';
import EtfTransactionModal from '../components/investment/EtfTransactionModal';
import HoldingsTable from '../components/investment/HoldingsTable';
import PortfolioLineChart from '../components/investment/PortfolioLineChart';
import PortfolioStats from '../components/investment/PortfolioStats';
import { usePortfolio } from '../analytics/hooks/usePortfolio';
import { useMarketData } from '../hooks/useMarketData';
import { useInvestmentStore } from '../store/useInvestmentStore';

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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [etfModalOpen, setEtfModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('1Y');

  const { brokerAccounts, selectedBrokerId, setSelectedBroker } = useInvestmentStore();
  const portfolio = usePortfolio();
  const { refreshPrices, isUpdating } = useMarketData();

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
          <Button variant="outlined" startIcon={<Refresh />} onClick={refreshPrices} disabled={isUpdating}>
            {isUpdating ? 'Updating...' : 'Refresh Prices'}
          </Button>
          <Button variant="outlined" startIcon={<Settings />} onClick={() => setSettingsOpen(true)}>
            Settings
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
            <HoldingsTable holdings={portfolio.holdings} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <AllocationDonutChart data={donutData} title="Allocation" />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <PortfolioLineChart data={chartData} timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          </Grid>
        </Grid>
      </TabPanel>

      <EtfTransactionModal open={etfModalOpen} onClose={() => setEtfModalOpen(false)} defaultBrokerId={selectedBrokerId === 'all' ? undefined : selectedBrokerId} />
      <BrokerSettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </Box>
  );
};

export default InvestmentPage;
