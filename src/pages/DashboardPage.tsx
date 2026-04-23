import { DirectionsCar as CarIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Typography } from '@mui/material';
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

  // For edit functionality - local to this page
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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.6 }}>
          Welcome back! Here's your financial overview.
        </Typography>
      </Box>

      {showMileageReminder && (
        <Alert
          severity="info"
          icon={<CarIcon fontSize="inherit" />}
          sx={{ mb: 4, borderRadius: 3, border: '1px solid rgba(2, 136, 209, 0.2)' }}
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

      <RecapCards />

      <Charts />

      <TransactionTable onEdit={handleEditTransaction} limit={10} />

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
