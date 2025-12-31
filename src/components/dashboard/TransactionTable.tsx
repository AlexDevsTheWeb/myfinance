import { Delete, Edit, OpenInNew } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinanceStore, type Transaction } from '../../store/useFinanceStore';

interface TransactionTableProps {
  onEdit: (transaction: Transaction) => void;
  limit?: string | number;
  customData?: Transaction[];
}

const TransactionTable: React.FC<TransactionTableProps> = ({ onEdit, limit, customData }) => {
  const { transactions: storeTransactions, deleteTransaction } = useFinanceStore();
  const navigate = useNavigate();

  const currentMonth = dayjs().month();
  const currentYear = dayjs().year();

  const filteredTransactions = limit && typeof limit === 'string'
    ? [...(customData || storeTransactions)]
    : ([...(customData || storeTransactions)]
      .filter(t => dayjs(t.date).month() === currentMonth && dayjs(t.date).year() === currentYear))
    ;
  const transactions = filteredTransactions
    .sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix());
  const displayedTransactions = limit && typeof limit === 'string' ? transactions : transactions;

  return (
    <Paper sx={{ mt: 4 }}>

      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{`Transactions: ${dayjs().month(currentMonth).format('MMMM').toUpperCase()}`}</Typography>

        {!limit &&
          <Button
            size='small'
            onClick={() => navigate('/transactions')}
            sx={{ fontWeight: 600, textTransform: 'none' }}
            endIcon={<OpenInNew sx={{ fontSize: '1rem !important' }} />}
          >
            Show All Transactions
          </Button>}
      </Box>
      <TableContainer>
        <Table>
          <TableHead sx={{ background: 'rgba(255,255,255,0.02)' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Type</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Amount</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'rgba(255,255,255,0.3)' }}>
                  No transactions yet. Add your first one!
                </TableCell>
              </TableRow>
            ) : (
              displayedTransactions.map((t) => (
                <TableRow key={t.id} sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { background: 'rgba(255,255,255,0.01)' } }}>
                  <TableCell>{dayjs(t.date).format('DD MMM YYYY')}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{t.description}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{t.category}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.5 }}>{t.subcategory}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t.type.toUpperCase()}
                      size="small"
                      color={t.type === 'income' ? 'success' : 'error'}
                      variant="outlined"
                      sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                    {t.type === 'income' ? '+' : '-'} € {t.amount.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => onEdit(t)} sx={{ color: 'primary.main' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => { if (window.confirm('Are you sure you want to delete this transaction?')) deleteTransaction(t.id); }} sx={{ color: 'error.main' }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {!limit &&
        <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <Typography
            variant="button"
            component="a"
            href="/transactions"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Show All Transactions
          </Typography>
        </Box>
      }
    </Paper>
  );
};

export default TransactionTable;
