import {
  ArrowDownward,
  ArrowUpward,
  ContentCopy,
  Delete,
  Edit,
  MoreVert,
} from '@mui/icons-material';
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
import { pageWindow } from '../ledger/ledger.utils';
import { formatCurrency, formatNumber } from '../../utils/format.utils';
import type { CarRow } from './car.utils';
import { EXPENSE_COLORS, ROWS_PER_PAGE_OPTIONS, VEHICLE_COLORS, type CarSort, type CarSortField } from './types';

interface CarExpenseTableProps {
  rows: CarRow[];
  sort: CarSort;
  onSortChange: (field: CarSortField) => void;
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (row: CarRow) => void;
  onDuplicate: (row: CarRow) => void;
  onDelete: (row: CarRow) => void;
}

const COLUMN_COUNT = 10;

const headerCellSx = {
  fontSize: '0.66rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase' as const,
  color: 'colors.subtle',
  py: 1.1,
  px: 1.5,
  borderColor: 'colors.border',
  whiteSpace: 'nowrap' as const,
  bgcolor: 'colors.surfaceNested',
};

const bodyCellSx = { py: 1.1, px: 1.5, borderColor: 'rgba(30,41,59,0.5)' };
const mono = { fontFamily: (theme: Theme) => theme.colors.mono, fontVariantNumeric: 'tabular-nums' as const };

const Chip: React.FC<{ label: string; color: string; caption?: string }> = ({ label, color, caption }) => (
  <Box
    component="span"
    sx={{
      display: 'inline-flex',
      flexDirection: 'column',
      px: 0.75,
      py: 0.2,
      borderRadius: 1,
      fontSize: '0.68rem',
      fontWeight: 600,
      lineHeight: 1.3,
      border: '1px solid',
      borderColor: `${color}55`,
      bgcolor: `${color}1F`,
      color,
      whiteSpace: 'nowrap',
    }}
  >
    {label}
    {caption && (
      <Box component="span" sx={{ fontSize: '0.6rem', fontWeight: 500, opacity: 0.75 }}>
        {caption}
      </Box>
    )}
  </Box>
);

const CarExpenseTable: React.FC<CarExpenseTableProps> = ({
  rows,
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
  const [menuRow, setMenuRow] = React.useState<CarRow | null>(null);

  const openMenu = (event: React.MouseEvent<HTMLElement>, row: CarRow) => {
    setMenuAnchor(event.currentTarget);
    setMenuRow(row);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  const SortIcon = sort.direction === 'asc' ? ArrowUpward : ArrowDownward;
  const sortableHeader = (field: CarSortField, label: string, align?: 'right') => (
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
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1120 }}>
          <TableHead>
            <TableRow>
              {sortableHeader('date', t('car.table.date'))}
              <TableCell sx={headerCellSx}>{t('car.table.vehicle')}</TableCell>
              <TableCell sx={headerCellSx}>{t('car.table.type')}</TableCell>
              <TableCell sx={headerCellSx}>{t('car.table.description')}</TableCell>
              {sortableHeader('odometer', t('car.table.odometer'), 'right')}
              <TableCell align="right" sx={headerCellSx}>
                {t('car.table.liters')}
              </TableCell>
              <TableCell align="right" sx={headerCellSx}>
                {t('car.table.pricePerLiter')}
              </TableCell>
              {sortableHeader('amount', t('car.table.total'), 'right')}
              <TableCell align="right" sx={headerCellSx}>
                {t('car.table.efficiency')}
              </TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, width: 52 }}>
                {t('car.table.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} align="center" sx={{ py: 6, color: 'colors.subtle' }}>
                  {t('car.table.empty')}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const { transaction } = row;
                const vehicleColor = VEHICLE_COLORS[row.vehicleType];
                const typeColor = row.expenseType ? EXPENSE_COLORS[row.expenseType] : 'colors.muted';
                return (
                  <TableRow key={transaction.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontSize: '0.72rem', color: 'colors.subtle' }}>
                        {dayjs(transaction.date).format('DD MMM YYYY').toUpperCase()}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Chip
                        label={row.vehicleName ?? t('car.vehicles.unassigned')}
                        caption={t(`car.vehicles.${row.vehicleType}`)}
                        color={vehicleColor}
                      />
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      {row.expenseType ? (
                        <Chip label={t(`car.expenseTypes.${row.expenseType}`)} color={typeColor} />
                      ) : (
                        <Typography variant="caption" sx={{ color: 'colors.muted' }}>
                          —
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}>
                        {transaction.description}
                      </Typography>
                      <Typography noWrap variant="caption" sx={{ color: 'colors.subtle' }}>
                        {transaction.subcategory}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontSize: '0.75rem' }}>
                        {transaction.odometerKm !== undefined ? `${formatNumber(transaction.odometerKm)} km` : '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontSize: '0.75rem' }}>
                        {transaction.liters !== undefined ? `${formatNumber(transaction.liters, 1)} L` : '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontSize: '0.75rem', color: 'colors.amber' }}>
                        {row.pricePerLiter === null ? '—' : `${formatNumber(row.pricePerLiter, 3)} €/L`}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontWeight: 700, fontSize: '0.8rem' }}>
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Typography
                        noWrap
                        sx={{ ...mono, fontSize: '0.75rem', color: row.kmPerLiter === null ? 'colors.muted' : 'colors.emerald' }}
                      >
                        {row.kmPerLiter === null ? '—' : `${formatNumber(row.kmPerLiter, 1)} km/L`}
                      </Typography>
                    </TableCell>

                    <TableCell align="center" sx={bodyCellSx}>
                      <IconButton
                        size="small"
                        aria-label={`${t('car.table.actions')} — ${transaction.description}`}
                        onClick={(event) => openMenu(event, row)}
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
          {t('car.table.shownRange', {
            from: formatNumber(first),
            to: formatNumber(last),
            total: formatNumber(total),
          })}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" noWrap sx={{ color: 'colors.subtle' }}>
              {t('car.table.rowsPerPage')}
            </Typography>
            <Select
              size="small"
              value={rowsPerPage}
              onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
              inputProps={{ 'aria-label': t('car.table.rowsPerPage') }}
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
              aria-label={t('car.table.previous')}
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
              aria-label={t('car.table.next')}
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
            if (menuRow) onEdit(menuRow);
            closeMenu();
          }}
          sx={{ fontSize: '0.8rem', gap: 1 }}
        >
          <Edit sx={{ fontSize: 16 }} /> {t('common.edit')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) onDuplicate(menuRow);
            closeMenu();
          }}
          sx={{ fontSize: '0.8rem', gap: 1 }}
        >
          <ContentCopy sx={{ fontSize: 16 }} /> {t('car.table.duplicate')}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) onDelete(menuRow);
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

export default CarExpenseTable;
