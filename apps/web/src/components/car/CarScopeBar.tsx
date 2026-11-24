import { Box, Button, MenuItem, Paper, Select, Typography } from '@mui/material';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../utils/format.utils';
import type { VehicleOption } from './car.utils';
import { UNASSIGNED_VEHICLE, type CarPeriod, type CarVehicleFilter } from './car.utils';

interface CarScopeBarProps {
  vehicles: VehicleOption[];
  vehicle: CarVehicleFilter;
  onVehicleChange: (value: CarVehicleFilter) => void;
  years: number[];
  period: CarPeriod;
  onPeriodChange: (value: CarPeriod) => void;
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

const CarScopeBar: React.FC<CarScopeBarProps> = ({
  vehicles,
  vehicle,
  onVehicleChange,
  years,
  period,
  onPeriodChange,
}) => {
  const { t } = useTranslation();

  const vehicleLabel = (option: VehicleOption): string =>
    option.name ?? t('car.vehicles.unassigned');

  const selectedLabel =
    vehicle === 'all'
      ? t('car.filters.allVehicles')
      : vehicle === UNASSIGNED_VEHICLE
        ? t('car.vehicles.unassigned')
        : vehicle;

  return (
    <Paper sx={{ p: 1.5, borderRadius: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
          <Select
            size="small"
            value={vehicle}
            onChange={(event) => onVehicleChange(event.target.value)}
            displayEmpty
            renderValue={() => selectedLabel}
            inputProps={{ 'aria-label': t('car.filters.vehicle') }}
            sx={{
              minWidth: 190,
              height: 34,
              fontSize: '0.75rem',
              bgcolor: 'colors.bg',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'colors.border' },
            }}
          >
            <MenuItem value="all" sx={{ fontSize: '0.8rem' }}>
              {t('car.filters.allVehicles')}
            </MenuItem>
            {vehicles.map((option) => (
              <MenuItem key={option.key} value={option.key} sx={{ fontSize: '0.8rem', gap: 1 }}>
                <Box component="span" sx={{ flexGrow: 1 }}>
                  {vehicleLabel(option)}
                </Box>
                <Typography component="span" variant="caption" sx={{ color: 'colors.subtle' }}>
                  {t(`car.vehicles.${option.type}`)} · {formatNumber(option.count)}
                </Typography>
              </MenuItem>
            ))}
          </Select>

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
            {(['all' as const, ...years]).map((value) => {
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
                  {value === 'all' ? t('car.filters.allYears') : formatNumber(value)}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Typography variant="caption" sx={{ color: 'colors.subtle' }}>
          {t('car.filters.isolation')}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CarScopeBar;
