import { Box, CircularProgress } from '@mui/material';
import React from 'react';
import AccountDetailDialog from '../components/dashboard/AccountDetailDialog';
import BentoWidgetsRow from '../components/dashboard/BentoWidgetsRow';
import CalendarMasterDetailSection from '../components/dashboard/CalendarMasterDetailSection';
import ChartsRow from '../components/dashboard/ChartsRow';
import KpiMetricsRow from '../components/dashboard/KpiMetricsRow';
import TopBar from '../components/layout/TopBar';
import { useFinanceStore } from '../store/useFinanceStore';

const DashboardPage: React.FC = () => {
  const { isLoading } = useFinanceStore();
  const [accountDialogOpen, setAccountDialogOpen] = React.useState(false);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <TopBar />
      <Box sx={{ p: { xs: 2, md: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <KpiMetricsRow onOpenAccountDetail={() => setAccountDialogOpen(true)} />
        <CalendarMasterDetailSection />
        <BentoWidgetsRow />
        <ChartsRow />
      </Box>
      <AccountDetailDialog open={accountDialogOpen} onClose={() => setAccountDialogOpen(false)} />
    </Box>
  );
};

export default DashboardPage;
