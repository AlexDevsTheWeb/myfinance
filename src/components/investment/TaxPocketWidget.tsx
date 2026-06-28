import { Box, Card, CardContent, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useTaxTracking } from '../../analytics/hooks/useTaxTracking';

const formatEur = (v: number) => `€${v.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const TaxPocketWidget: React.FC = () => {
  const { t } = useTranslation();
  const { yearly, totalRealizedGains, totalTaxDue } = useTaxTracking();

  return (
    <Card sx={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
      <CardContent sx={{ p: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t('investment.taxPocket')}
          </Typography>
          <Chip
            label={`26%`}
            size="small"
            sx={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 700 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>{t('investment.realizedGains')}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: totalRealizedGains > 0 ? '#f59e0b' : 'inherit' }}>
              {formatEur(totalRealizedGains)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>{t('investment.taxDue')}</Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: totalTaxDue > 0 ? '#ef4444' : 'inherit' }}>
              {formatEur(totalTaxDue)}
            </Typography>
          </Box>
        </Box>

        {yearly.length > 0 ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ opacity: 0.6, fontWeight: 600 }}>{t('investment.taxYear')}</TableCell>
                <TableCell sx={{ opacity: 0.6, fontWeight: 600 }} align="right">{t('investment.realizedGains')}</TableCell>
                <TableCell sx={{ opacity: 0.6, fontWeight: 600 }} align="right">{t('investment.taxDue')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {yearly.map((y) => (
                <TableRow key={y.year}>
                  <TableCell sx={{ fontWeight: 600 }}>{y.year}</TableCell>
                  <TableCell align="right" sx={{ color: y.realizedGains > 0 ? '#f59e0b' : 'inherit' }}>
                    {formatEur(y.realizedGains)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: y.taxDue > 0 ? '#ef4444' : 'inherit', fontWeight: 600 }}>
                    {formatEur(y.taxDue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" sx={{ opacity: 0.5, mt: 1 }}>
            {t('investment.noTaxEvents')}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxPocketWidget;
