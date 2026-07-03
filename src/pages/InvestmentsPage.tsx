import { Box, CircularProgress, Tab, Tabs } from '@mui/material';
import React, { Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import InvestmentPage from './InvestmentPage';

const ProjectionsPage = React.lazy(() => import('./ProjectionsPage'));

const InvestmentsPage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const { t } = useTranslation();

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="primary" sx={{ mb: 2 }}>
        <Tab label={t('investment.navInvestments')} />
        <Tab label={t('nav.projections')} />
      </Tabs>
      {tab === 0 && <InvestmentPage />}
      {tab === 1 && (
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
          <ProjectionsPage />
        </Suspense>
      )}
    </Box>
  );
};

export default InvestmentsPage;
