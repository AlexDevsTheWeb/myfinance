import { FormControlLabel, Grid, Paper, Slider, Stack, Switch, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { IProjectionInput } from '../../store/types';

interface ProjectionControlsProps {
  input: IProjectionInput;
  onChange: (key: keyof IProjectionInput, value: number) => void;
  onInflationToggle?: (enabled: boolean) => void;
}

const ProjectionControls: React.FC<ProjectionControlsProps> = ({ input, onChange, onInflationToggle }) => {
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t('projections.horizon')}: {input.years} {t('projections.horizonSuffix')}
          </Typography>
          <Slider
            value={input.years}
            min={1}
            max={50}
            step={1}
            marks={[
              { value: 10, label: '10yr' },
              { value: 20, label: '20yr' },
              { value: 30, label: '30yr' },
              { value: 40, label: '40yr' },
              { value: 50, label: '50yr' },
            ]}
            onChange={(_, v) => onChange('years', v as number)}
            sx={{ color: '#5b6cb8' }}
          />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t('projections.etfReturn')}: {(input.etfAnnualReturn * 100).toFixed(1)}%
          </Typography>
          <Slider
            value={input.etfAnnualReturn * 100}
            min={0}
            max={20}
            step={0.5}
            marks={[
              { value: 0, label: '0%' },
              { value: 5, label: '5%' },
              { value: 10, label: '10%' },
              { value: 15, label: '15%' },
              { value: 20, label: '20%' },
            ]}
            onChange={(_, v) => onChange('etfAnnualReturn', (v as number) / 100)}
            sx={{ color: '#5b6cb8' }}
          />
        </Stack>

        <Stack spacing={1}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t('projections.cashRate')}: {(input.cashAnnualRate * 100).toFixed(2)}%
          </Typography>
          <Slider
            value={input.cashAnnualRate * 100}
            min={0}
            max={10}
            step={0.25}
            marks={[
              { value: 0, label: '0%' },
              { value: 2, label: '2%' },
              { value: 5, label: '5%' },
              { value: 7.5, label: '7.5%' },
              { value: 10, label: '10%' },
            ]}
            onChange={(_, v) => onChange('cashAnnualRate', (v as number) / 100)}
            sx={{ color: '#5b6cb8' }}
          />
        </Stack>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={`${t('projections.lumpSum')} (€)`}
              type="number"
              value={input.initialLumpSum}
              onChange={(e) => onChange('initialLumpSum', Math.max(0, Number(e.target.value)))}
              slotProps={{ htmlInput: { min: 0 } }}
              variant="outlined"
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={`${t('projections.monthlyPac')} (€)`}
              type="number"
              value={input.monthlyPac}
              onChange={(e) => onChange('monthlyPac', Math.max(0, Number(e.target.value)))}
              slotProps={{ htmlInput: { min: 0 } }}
              variant="outlined"
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={`${t('projections.annualInflow')} (€)`}
              type="number"
              value={input.annualInflow}
              onChange={(e) => onChange('annualInflow', Math.max(0, Number(e.target.value)))}
              slotProps={{ htmlInput: { min: 0 } }}
              variant="outlined"
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>

        <FormControlLabel
          control={
            <Switch
              checked={input.adjustForInflation ?? false}
              onChange={(e) => onInflationToggle?.(e.target.checked)}
              sx={{ color: '#5b6cb8' }}
            />
          }
          label={`${t('projections.adjustForInflation')} (${((input.inflationRate ?? 0.02) * 100).toFixed(0)}%)`}
        />
      </Stack>
    </Paper>
  );
};

export default ProjectionControls;
