import { Box, Tab, Tabs } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InsightsPage from './InsightsPage';
import SalaryPage from './SalaryPage';

const FinancePage: React.FC = () => {
  const [tab, setTab] = useState(0);
  const { t } = useTranslation();

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} textColor="inherit" indicatorColor="primary" sx={{ mb: 2 }}>
        <Tab label={t('salary.title')} />
        <Tab label={t('insights.title')} />
      </Tabs>
      {tab === 0 && <SalaryPage />}
      {tab === 1 && <InsightsPage />}
    </Box>
  );
};

export default FinancePage;
