import { ArrowDownward, ArrowUpward, DirectionsCar as CarIcon } from '@mui/icons-material';
import { Alert, AlertTitle, Box, Button, Fab, Typography, Zoom } from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Charts from '../components/dashboard/Charts';
import RecapCards from '../components/dashboard/RecapCards';
import TransactionTable from '../components/dashboard/TransactionTable';
import TransactionModal from '../components/modals/TransactionModal';
import { useFinanceStore, type Transaction } from '../store/useFinanceStore';

const DashboardPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const navigate = useNavigate();
  const { enabledModules, carMileage } = useFinanceStore();

  const isFirstOfMonth = dayjs().date() === 1;
  const hasReadingThisMonth = carMileage.some(m => m.month === (dayjs().month() + 1) && m.year === dayjs().year());
  const showMileageReminder = enabledModules.carManagement && isFirstOfMonth && !hasReadingThisMonth;

  const handleOpenModal = (type: 'income' | 'expense') => {
    setTransactionToEdit(null);
    setModalType(type);
    setModalOpen(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setTransactionToEdit(transaction);
    setModalType(transaction.type);
    setModalOpen(true);
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

      <TransactionTable onEdit={handleEditTransaction} />

      <Box sx={{ position: 'fixed', bottom: 32, right: 32, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Zoom in={true} style={{ transitionDelay: '300ms' }}>
          <Fab color="success" variant="extended" size="large" onClick={() => handleOpenModal('income')} sx={{ boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)' }}>
            <ArrowUpward sx={{ mr: 1 }} />
            New Income
          </Fab>
        </Zoom>
        <Zoom in={true} style={{ transitionDelay: '400ms' }}>
          <Fab color="error" variant="extended" size="large" onClick={() => handleOpenModal('expense')} sx={{ boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)' }}>
            <ArrowDownward sx={{ mr: 1 }} />
            New Expense
          </Fab>
        </Zoom>
      </Box>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        transaction={transactionToEdit}
      />
    </Box>
  );
};

export default DashboardPage;
