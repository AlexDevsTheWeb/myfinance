import { ArrowDownward, ArrowUpward, ContentCopy, Delete, Edit, MoreVert } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import type { Theme } from '@mui/material/styles';
import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Account, Card, Transaction } from '../../store/useFinanceStore';
import { formatNumber, formatSignedCurrency } from '../../utils/format.utils';
import { pageWindow } from './ledger.utils';
import type { LedgerColumnVisibility, LedgerSort } from './types';

export interface LedgerTransactionsTableProps {
  transactions: Transaction[];
  accounts: Account[];
  cards: Card[];
  columns: LedgerColumnVisibility;
  sort: LedgerSort;
  onSortChange: (field: LedgerSort['field']) => void;
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (transaction: Transaction) => void;
  onDuplicate: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const headerCellSx = {
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'colors.subtle',
  py: 1.25,
  px: 2,
  borderColor: 'colors.border',
  whiteSpace: 'nowrap' as const,
  bgcolor: 'colors.surfaceNested',
};

const bodyCellSx = { py: 1.5, px: 2, borderColor: 'rgba(30,41,59,0.5)' };

const mono = { fontFamily: (theme: Theme) => theme.colors.mono, fontVariantNumeric: 'tabular-nums' as const };

const LedgerTransactionsTable: React.FC<LedgerTransactionsTableProps> = ({
  transactions,
  accounts,
  cards,
  columns,
  sort,
  onSortChange,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const { t } = useTranslation();
  const [menuAnchor, setMenuAnchor] = React.useState<null | HTMLElement>(null);
  const [menuTransaction, setMenuTransaction] = React.useState<Transaction | null>(null);

  const accountName = React.useCallback(
    (id: string) => accounts.find((account) => account.id === id)?.name ?? '—',
    [accounts],
  );
  const cardName = React.useCallback(
    (id: string | undefined) => (id ? cards.find((card) => card.id === id)?.name : undefined),
    [cards],
  );

  const openMenu = (event: React.MouseEvent<HTMLElement>, transaction: Transaction) => {
    setMenuAnchor(event.currentTarget);
    setMenuTransaction(transaction);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuTransaction(null);
  };

  const SortIcon = sort.direction === 'asc' ? ArrowUpward : ArrowDownward;
  const sortableHeader = (field: LedgerSort['field'], label: string, align?: 'right') => (
    <TableCell align={align} sx={headerCellSx}>
      <Box
        component="button"
        onClick={() => onSortChange(field)}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          background: 'none',
          border: 0,
          p: 0,
          cursor: 'pointer',
          color: sort.field === field ? 'colors.cyan' : 'inherit',
          font: 'inherit',
          letterSpacing: 'inherit',
          textTransform: 'inherit',
        }}
      >
        {label}
        {sort.field === field && <SortIcon sx={{ fontSize: 12 }} />}
      </Box>
    </TableCell>
  );

  const pageCount = Math.max(1, Math.ceil(total / rowsPerPage));
  const first = total === 0 ? 0 : page * rowsPerPage + 1;
  const last = Math.min(total, (page + 1) * rowsPerPage);

  return (
    <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {sortableHeader('date', t('transactions.ledger.table.date'))}
              <TableCell sx={headerCellSx}>{t('transactions.ledger.table.descriptionCategory')}</TableCell>
              {columns.account && <TableCell sx={headerCellSx}>{t('transactions.ledger.table.accountMethod')}</TableCell>}
              {columns.type && <TableCell sx={headerCellSx}>{t('transactions.ledger.table.type')}</TableCell>}
              {sortableHeader('amount', t('transactions.ledger.table.amount'), 'right')}
              <TableCell align="center" sx={{ ...headerCellSx, width: 56 }}>
                {t('transactions.ledger.table.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'colors.subtle' }}>
                  {t('transactions.noTransactionsPeriod')}
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => {
                const isIncome = transaction.type === 'income';
                const isTransfer = transaction.type === 'transfer';
                const amountColor = isTransfer ? 'colors.subtle' : isIncome ? 'colors.emerald' : 'colors.rose';
                const card = cardName(transaction.cardId);

                return (
                  <TableRow key={transaction.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontSize: '0.75rem', color: 'colors.subtle' }}>
                        {dayjs(transaction.date).format('DD MMM YYYY').toUpperCase()}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.3 }}>
                        {transaction.description}
                      </Typography>
                      {columns.category && (
                        <Typography noWrap variant="caption" sx={{ color: 'colors.subtle' }}>
                          {transaction.subcategory
                            ? `${transaction.category} • ${transaction.subcategory}`
                            : transaction.category}
                        </Typography>
                      )}
                    </TableCell>

                    {columns.account && (
                      <TableCell sx={bodyCellSx}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'colors.cyan', flexShrink: 0 }} />
                          <Typography noWrap variant="caption" sx={{ color: 'colors.subtle' }}>
                            {accountName(transaction.accountId)}
                            {card ? ` • ${card}` : ''}
                          </Typography>
                        </Box>
                      </TableCell>
                    )}

                    {columns.type && (
                      <TableCell sx={bodyCellSx}>
                        {transaction.recurringLinkId ? (
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              border: '1px solid',
                              borderColor: 'rgba(245,158,11,0.3)',
                              bgcolor: 'rgba(245,158,11,0.1)',
                              color: 'colors.amber',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t('transactions.ledger.table.recurring')}
                          </Box>
                        ) : (
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              px: 0.75,
                              py: 0.25,
                              borderRadius: 1,
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              border: '1px solid',
                              borderColor: 'colors.border',
                              bgcolor: 'colors.surfaceNested',
                              color: 'colors.subtle',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {t('transactions.ledger.table.oneOff')}
                          </Box>
                        )}
                      </TableCell>
                    )}

                    <TableCell align="right" sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontWeight: 700, fontSize: '0.85rem', color: amountColor }}>
                        {formatSignedCurrency(isIncome ? transaction.amount : -transaction.amount)}
                      </Typography>
                    </TableCell>

                    <TableCell align="center" sx={bodyCellSx}>
                      <IconButton
                        size="small"
                        aria-label={`${t('transactions.ledger.table.actions')} — ${transaction.description}`}
                        onClick={(event) => openMenu(event, transaction)}
                        sx={{ color: 'colors.subtle' }}
                      >
                        <MoreVert sx={{ fontSize: 18 }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          px: 2,
          py: 1.25,
          bgcolor: 'colors.surfaceNested',
          borderTop: '1px solid',
          borderColor: 'colors.border',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Typography variant="caption" noWrap sx={{ color: 'colors.subtle' }}>
          {t('transactions.ledger.table.shownRange', {
            from: formatNumber(first),
            to: formatNumber(last),
            total: formatNumber(total),
          })}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" noWrap sx={{ color: 'colors.subtle' }}>
              {t('transactions.ledger.table.rowsPerPage')}
            </Typography>
            <Select
              size="small"
              value={rowsPerPage}
              onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
              inputProps={{ 'aria-label': t('transactions.ledger.table.rowsPerPage') }}
              sx={{
                height: 28,
                fontSize: '0.72rem',
                bgcolor: 'colors.surface',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'colors.border' },
                ...mono,
              }}
            >
              {ROWS_PER_PAGE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option} sx={{ fontSize: '0.75rem' }}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <Button
              size="small"
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              aria-label={t('transactions.ledger.table.previous')}
              sx={{ minWidth: 0, px: 0.75, py: 0.25, fontSize: '0.75rem', color: 'colors.subtle' }}
            >
              ‹
            </Button>
            {pageWindow(page, pageCount).map((item, index) =>
              item === 'gap' ? (
                <Typography key={`gap-${index}`} variant="caption" sx={{ px: 0.5, color: 'colors.muted' }}>
                  …
                </Typography>
              ) : (
                <Button
                  key={item}
                  size="small"
                  onClick={() => onPageChange(item)}
                  sx={{
                    minWidth: 28,
                    height: 28,
                    p: 0,
                    borderRadius: 1.5,
                    fontSize: '0.72rem',
                    ...mono,
                    color: item === page ? 'colors.cyan' : 'colors.subtle',
                    bgcolor: item === page ? 'rgba(6,182,212,0.18)' : 'transparent',
                    border: '1px solid',
                    borderColor: item === page ? 'rgba(6,182,212,0.4)' : 'transparent',
                    '&:hover': { bgcolor: item === page ? 'rgba(6,182,212,0.22)' : 'rgba(148,163,184,0.08)' },
                  }}
                >
                  {item + 1}
                </Button>
              ),
            )}
            <Button
              size="small"
              disabled={page >= pageCount - 1}
              onClick={() => onPageChange(page + 1)}
              aria-label={t('transactions.ledger.table.next')}
              sx={{ minWidth: 0, px: 0.75, py: 0.25, fontSize: '0.75rem', color: 'colors.subtle' }}
            >
              ›
            </Button>
          </Box>
        </Box>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuTransaction) onEdit(menuTransaction);
            closeMenu();
          }}
          sx={{ fontSize: '0.8rem', gap: 1 }}
        >
          <Edit sx={{ fontSize: 16 }} /> {t('common.edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuTransaction) onDuplicate(menuTransaction);
            closeMenu();
          }}
          sx={{ fontSize: '0.8rem', gap: 1 }}
        >
          <ContentCopy sx={{ fontSize: 16 }} /> {t('transactions.ledger.table.duplicate')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuTransaction) onDelete(menuTransaction);
            closeMenu();
          }}
          sx={{ fontSize: '0.8rem', gap: 1, color: 'colors.rose' }}
        >
          <Delete sx={{ fontSize: 16 }} /> {t('common.delete')}
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default LedgerTransactionsTable;
