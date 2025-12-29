import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { Box, Fab, Typography, Zoom } from '@mui/material';
import React, { useState } from 'react';
import Charts from '../components/dashboard/Charts';
import RecapCards from '../components/dashboard/RecapCards';
import TransactionTable from '../components/dashboard/TransactionTable';
import TransactionModal from '../components/modals/TransactionModal';
import type { Transaction } from '../store/useFinanceStore';

const DashboardPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);

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
