import { Add, Bolt, LocalFireDepartment, WaterDrop } from '@mui/icons-material';
import { Box, Button, FormControlLabel, Paper, Switch, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../utils/format.utils';
import { UTILITY_META, type UtilitiesPeriod, type UtilitiesTypeFilter } from './types';

interface UtilitiesFilterHeaderProps {
  years: number[];
  period: UtilitiesPeriod;
  onPeriodChange: (period: UtilitiesPeriod) => void;
  typeFilter: UtilitiesTypeFilter;
  onTypeFilterChange: (type: UtilitiesTypeFilter) => void;
  yoyEnabled: boolean;
  onYoyChange: (enabled: boolean) => void;
  /** YoY compares a year with the one before, so it needs a concrete year. */
  yoyDisabled: boolean;
  onAdd: () => void;
}

const pillSx = {
  px: 1.1,
  py: 0.3,
  minWidth: 0,
  fontSize: '0.72rem',
  fontWeight: 600,
  lineHeight: 1.6,
  textTransform: 'none',
  borderRadius: 1.5,
} as const;

const UtilitiesFilterHeader: React.FC<UtilitiesFilterHeaderProps> = ({
  years,
  period,
  onPeriodChange,
  typeFilter,
  onTypeFilterChange,
  yoyEnabled,
  onYoyChange,
  yoyDisabled,
  onAdd,
}) => {
  const { t } = useTranslation();

  const typeOptions: { value: UtilitiesTypeFilter; label: string; icon?: React.ReactNode }[] = [
    { value: 'all', label: t('utilities.types.all') },
    { value: 'electricity', label: t('utilities.types.electricityWithUnit'), icon: <Bolt sx={{ fontSize: 14 }} /> },
    { value: 'gas', label: t('utilities.types.gasWithUnit'), icon: <LocalFireDepartment sx={{ fontSize: 14 }} /> },
    { value: 'water', label: t('utilities.types.waterWithUnit'), icon: <WaterDrop sx={{ fontSize: 14 }} /> },
  ];

  return (
    <Paper sx={{ p: 1.5, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              p: 0.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'colors.border',
              bgcolor: 'colors.bg',
            }}
          >
            {[...years, 'all' as const].map((value) => {
              const active = period === value;
              return (
                <Button
                  key={String(value)}
                  size="small"
                  onClick={() => onPeriodChange(value)}
                  sx={{
                    ...pillSx,
                    color: active ? 'colors.cyan' : 'colors.subtle',
                    bgcolor: active ? 'rgba(6,182,212,0.18)' : 'transparent',
                    border: '1px solid',
                    borderColor: active ? 'rgba(6,182,212,0.4)' : 'transparent',
                    fontFamily: (theme) => theme.colors.mono,
                    '&:hover': { bgcolor: active ? 'rgba(6,182,212,0.22)' : 'rgba(148,163,184,0.08)' },
                  }}
                >
                  {value === 'all' ? t('utilities.filters.allYears') : formatNumber(value)}
                </Button>
              );
            })}
          </Box>

          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              p: 0.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'colors.border',
              bgcolor: 'colors.bg',
            }}
          >
            {typeOptions.map((option) => {
              const active = typeFilter === option.value;
              const accent =
                option.value === 'all' ? '6,182,212' : option.value === 'electricity' ? '245,158,11' : option.value === 'gas' ? '239,68,68' : '14,165,233';
              return (
                <Button
                  key={option.value}
                  size="small"
                  startIcon={option.icon}
                  onClick={() => onTypeFilterChange(option.value)}
                  sx={{
                    ...pillSx,
                    gap: 0.25,
                    color: active ? `rgb(${accent})` : 'colors.subtle',
                    bgcolor: active ? `rgba(${accent},0.16)` : 'transparent',
                    border: '1px solid',
                    borderColor: active ? `rgba(${accent},0.4)` : 'transparent',
                    '& .MuiButton-startIcon': { mr: 0.5, ml: 0 },
                    '&:hover': { bgcolor: active ? `rgba(${accent},0.22)` : 'rgba(148,163,184,0.08)' },
                  }}
                >
                  {option.label}
                </Button>
              );
            })}
          </Box>

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={yoyEnabled}
                disabled={yoyDisabled}
                onChange={(event) => onYoyChange(event.target.checked)}
              />
            }
            label={
              <Typography variant="caption" sx={{ color: yoyDisabled ? 'colors.muted' : 'colors.subtle', fontWeight: 600 }}>
                {t('utilities.filters.yoy')}
              </Typography>
            }
            sx={{ ml: 0.5, mr: 0 }}
          />
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<Add sx={{ fontSize: 16 }} />}
          onClick={onAdd}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.78rem',
            px: 1.75,
            py: 0.75,
            bgcolor: 'colors.emerald',
            color: '#04120c',
            '&:hover': { bgcolor: '#0ea371' },
          }}
        >
          {t('utilities.actions.addBill')}
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 1 }}>
        <Typography variant="caption" sx={{ color: 'colors.subtle' }}>
          {t('utilities.page.subtitle')}
        </Typography>
        {typeFilter !== 'all' && (
          <Typography variant="caption" sx={{ color: UTILITY_META[typeFilter].color }}>
            {t('utilities.units.hint', { unit: UTILITY_META[typeFilter].unit })}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default UtilitiesFilterHeader;
