import { Edit, Delete } from '@mui/icons-material';
import { IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import type { IInvestmentHolding } from '../../store/types';

const formatEur = (v: number) => `€${v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

interface HoldingsTableProps {
  holdings: IInvestmentHolding[];
  onEdit?: (holding: IInvestmentHolding) => void;
  onDelete?: (holding: IInvestmentHolding) => void;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onEdit, onDelete }) => {
  if (holdings.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ opacity: 0.5 }}>No ETF holdings</Typography>
      </Paper>
    );
  }

  const hasActions = !!(onEdit || onDelete);

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Ticker</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Units</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Avg Cost (€)</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Price (€)</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Value (€)</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Return (%)</TableCell>
            {hasActions && (
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {holdings.map((h) => (
            <TableRow key={h.ticker}>
              <TableCell sx={{ fontWeight: 700 }}>{h.ticker}</TableCell>
              <TableCell>{h.units.toFixed(4)}</TableCell>
              <TableCell>{formatEur(h.avgCost)}</TableCell>
              <TableCell>{formatEur(h.currentPrice)}</TableCell>
              <TableCell>{formatEur(h.value)}</TableCell>
              <TableCell sx={{ color: h.returnPercent >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>
                {h.returnPercent >= 0 ? '+' : ''}{h.returnPercent.toFixed(2)}%
              </TableCell>
              {hasActions && (
                <TableCell>
                  {onEdit && (
                    <IconButton size="small" onClick={() => onEdit(h)} title="Edit">
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton size="small" onClick={() => onDelete(h)} title="Delete">
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HoldingsTable;
