import { DirectionsCar as CarIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Grid, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Charts from '../components/dashboard/Charts';
import RecapCards from '../components/dashboard/RecapCards';
import TransactionTable from '../components/dashboard/TransactionTable';
import TransactionModal from '../components/modals/TransactionModal';
import { useFinanceStore, type Transaction } from '../store/useFinanceStore';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { enabledModules, carMileage } = useFinanceStore();

  const isFirstOfMonth = dayjs().date() === 1;
  const hasReadingThisMonth = carMileage.some(m => m.month === (dayjs().month() + 1) && m.year === dayjs().year());
  const showMileageReminder = enabledModules.carManagement && isFirstOfMonth && !hasReadingThisMonth;

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [editTransaction, setEditTransaction] = React.useState<Transaction | null>(null);
  const [editType, setEditType] = React.useState<'income' | 'expense'>('expense');

  const handleEditTransaction = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setEditType(transaction.type);
    setEditModalOpen(true);
  };

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
          Dashboard
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>
          Welcome back! Here's your financial overview.
        </Typography>
      </Box>

      {showMileageReminder && (
        <Alert
          severity="info"
          icon={<CarIcon fontSize="inherit" />}
          sx={{ mb: 3, borderRadius: 2, border: '1px solid rgba(2, 136, 209, 0.2)' }}
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/car')}>
              Vai alla gestione auto
            </Button>
          }
        >
          <AlertTitle sx={{ fontWeight: 700 }}>Promemoria Chilometri</AlertTitle>
          È il primo del mese! Non dimenticare di registrare il valore dei km letti sul cruscotto dell'auto.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 5 }}>
          <RecapCards />
          <Box sx={{ mt: 3 }}>
            <TransactionTable onEdit={handleEditTransaction} limit={8} />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Charts />
        </Grid>
      </Grid>

      <TransactionModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        type={editType}
        transaction={editTransaction}
      />
    </Box>
  );
};

export default DashboardPage;
