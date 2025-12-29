import { Delete, Edit } from '@mui/icons-material';
import { Box, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useFinanceStore, type Transaction } from '../../store/useFinanceStore';

interface TransactionTableProps {
  onEdit: (transaction: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ onEdit }) => {
  const { transactions, deleteTransaction } = useFinanceStore();

  return (
    <Paper sx={{ mt: 4, borderRadius: 4, overflow: 'hidden', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>Recent Transactions</Typography>
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
              transactions.map((t) => (
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
    </Paper>
  );
};

export default TransactionTable;
