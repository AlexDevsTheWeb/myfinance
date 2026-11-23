import {
  ArrowDownward,
  ArrowUpward,
  Bolt,
  ContentCopy,
  Delete,
  Edit,
  LocalFireDepartment,
  MoreVert,
  WaterDrop,
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
import { UTILITY_META, type UtilitiesSort } from './types';
import type { UtilityRow } from './utilities.utils';

interface UtilitiesTableProps {
  rows: UtilityRow[];
  sort: UtilitiesSort;
  onSortChange: (field: UtilitiesSort['field']) => void;
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit: (row: UtilityRow) => void;
  onDuplicate: (row: UtilityRow) => void;
  onDelete: (row: UtilityRow) => void;
}

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];
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

const UTILITY_ICON = {
  electricity: Bolt,
  gas: LocalFireDepartment,
  water: WaterDrop,
} as const;

const UtilitiesTable: React.FC<UtilitiesTableProps> = ({
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
  const [menuRow, setMenuRow] = React.useState<UtilityRow | null>(null);

  const openMenu = (event: React.MouseEvent<HTMLElement>, row: UtilityRow) => {
    setMenuAnchor(event.currentTarget);
    setMenuRow(row);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuRow(null);
  };

  const SortIcon = sort.direction === 'asc' ? ArrowUpward : ArrowDownward;
  const sortableHeader = (field: UtilitiesSort['field'], label: string, align?: 'right') => (
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
        <Table size="small" sx={{ minWidth: 1080 }}>
          <TableHead>
            <TableRow>
              {sortableHeader('date', t('utilities.table.period'))}
              <TableCell sx={headerCellSx}>{t('utilities.table.provider')}</TableCell>
              <TableCell sx={headerCellSx}>{t('utilities.table.kind')}</TableCell>
              {sortableHeader('amount', t('utilities.table.total'), 'right')}
              <TableCell align="right" sx={headerCellSx}>
                {t('utilities.table.fixedFee')}
              </TableCell>
              <TableCell align="right" sx={headerCellSx}>
                {t('utilities.table.energyFee')}
              </TableCell>
              <TableCell align="right" sx={headerCellSx}>
                {t('utilities.table.consumption')}
              </TableCell>
              <TableCell align="right" sx={headerCellSx}>
                {t('utilities.table.unitRate')}
              </TableCell>
              <TableCell sx={headerCellSx}>{t('utilities.table.meter')}</TableCell>
              <TableCell align="center" sx={{ ...headerCellSx, width: 52 }}>
                {t('utilities.table.actions')}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMN_COUNT} align="center" sx={{ py: 6, color: 'colors.subtle' }}>
                  {t('utilities.table.empty')}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const { transaction, type, fixed, energy, hasSplit, unitRate } = row;
                const meta = UTILITY_META[type];
                const Icon = UTILITY_ICON[type];
                const period =
                  transaction.readingDateStart && transaction.readingDateEnd
                    ? `${dayjs(transaction.readingDateStart).format('DD MMM')} → ${dayjs(transaction.readingDateEnd).format('DD MMM')}`
                    : null;

                return (
                  <TableRow key={transaction.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontSize: '0.72rem', color: 'colors.subtle' }}>
                        {dayjs(transaction.date).format('DD MMM YYYY').toUpperCase()}
                      </Typography>
                      {period && (
                        <Typography noWrap variant="caption" sx={{ ...mono, color: 'colors.muted', fontSize: '0.66rem' }}>
                          {period}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography noWrap sx={{ fontWeight: 600, fontSize: '0.8rem', lineHeight: 1.3 }}>
                        {transaction.provider || transaction.description}
                      </Typography>
                      <Typography noWrap variant="caption" sx={{ color: 'colors.subtle' }}>
                        {transaction.provider ? transaction.description : transaction.subcategory}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Box
                        component="span"
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.4,
                          px: 0.75,
                          py: 0.2,
                          borderRadius: 1,
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          border: '1px solid',
                          borderColor: `${meta.color}55`,
                          bgcolor: `${meta.color}1F`,
                          color: meta.color,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Icon sx={{ fontSize: 12 }} />
                        {t(`utilities.types.${type}`)}
                      </Box>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontWeight: 700, fontSize: '0.8rem' }}>
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontSize: '0.75rem', color: hasSplit ? 'colors.subtle' : 'colors.muted' }}>
                        {hasSplit ? formatCurrency(fixed) : '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Typography
                        noWrap
                        sx={{ ...mono, fontSize: '0.75rem', color: hasSplit ? meta.color : 'colors.muted' }}
                      >
                        {hasSplit ? formatCurrency(energy) : '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontSize: '0.75rem' }}>
                        {transaction.consumption !== undefined
                          ? `${formatNumber(transaction.consumption, 1)} ${meta.unit}`
                          : '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="right" sx={bodyCellSx}>
                      <Typography noWrap sx={{ ...mono, fontSize: '0.75rem', color: 'colors.amber' }}>
                        {unitRate === null ? '—' : `${formatNumber(unitRate, 4)} €/${meta.unit}`}
                      </Typography>
                    </TableCell>

                    <TableCell sx={bodyCellSx}>
                      <Typography noWrap variant="caption" sx={{ ...mono, color: 'colors.subtle' }}>
                        {transaction.meterId || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell align="center" sx={bodyCellSx}>
                      <IconButton
                        size="small"
                        aria-label={`${t('utilities.table.actions')} — ${transaction.description}`}
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
          {t('utilities.table.shownRange', {
            from: formatNumber(first),
            to: formatNumber(last),
            total: formatNumber(total),
          })}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" noWrap sx={{ color: 'colors.subtle' }}>
              {t('utilities.table.rowsPerPage')}
            </Typography>
            <Select
              size="small"
              value={rowsPerPage}
              onChange={(event) => onRowsPerPageChange(Number(event.target.value))}
              inputProps={{ 'aria-label': t('utilities.table.rowsPerPage') }}
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
              aria-label={t('utilities.table.previous')}
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
              aria-label={t('utilities.table.next')}
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
          <ContentCopy sx={{ fontSize: 16 }} /> {t('utilities.table.duplicate')}
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

export default UtilitiesTable;
