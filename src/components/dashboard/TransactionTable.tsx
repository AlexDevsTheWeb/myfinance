import { Delete, Edit, OpenInNew } from '@mui/icons-material';
import { Box, Button, Chip, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Tooltip, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useFinanceStore, type Transaction } from '../../store/useFinanceStore';

interface TransactionTableProps {
  onEdit: (transaction: Transaction) => void;
  limit?: string | number; // Kept for backward compatibility on dashboard
  customData?: Transaction[];
  // Pagination props
  count?: number;
  page?: number;
  rowsPerPage?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  onEdit, 
  limit, 
  customData,
  count,
  page,
  rowsPerPage,
  onPageChange
}) => {
  const { transactions: storeTransactions, deleteTransaction } = useFinanceStore();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Logic for dashboard view (limit is a number)
  const getDashboardTransactions = () => {
    const currentMonth = dayjs().month();
    const currentYear = dayjs().year();
    return storeTransactions
      .filter(t => dayjs(t.date).month() === currentMonth && dayjs(t.date).year() === currentYear)
      .sort((a, b) => dayjs(b.date).unix() - dayjs(a.date).unix())
      .slice(0, Number(limit));
  }

  // On TransactionsPage, customData is provided and already filtered/sorted.
  // On Dashboard, limit is a number, and customData is undefined.
  const displayedTransactions = customData 
    ? customData 
    : getDashboardTransactions();

  const isPaginated = onPageChange !== undefined && page !== undefined && rowsPerPage !== undefined && count !== undefined;

  const isDashboard = typeof limit === 'number' && limit > 0;

  return (
    <Paper>
      <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {isDashboard ? t('dashboard.recentTransactions') : t('transactions.title')}
        </Typography>

        {isDashboard &&
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
            {displayedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'rgba(255,255,255,0.3)' }}>
                  No transactions for this period.
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

      {isPaginated && (
        <TablePagination
            component="div"
            count={count}
            page={page}
            onPageChange={onPageChange}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[20]}
        />
      )}
    </Paper>
  );
};

export default TransactionTable;
