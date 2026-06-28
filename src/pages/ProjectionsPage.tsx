import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProjectionChart from '../components/projections/ProjectionChart';
import ProjectionControls from '../components/projections/ProjectionControls';
import ProjectionSummary from '../components/projections/ProjectionSummary';
import { useProjections } from '../hooks/useProjections';

const ProjectionsPage: React.FC = () => {
  const { input, snapshots, summary, chartData, setParam, setInflationToggle, useRealPerformance, setUseRealPerformance, realCagr } = useProjections();
  const { t } = useTranslation();

  const realFinalCapital =
    input.adjustForInflation && snapshots.length > 0
      ? snapshots[snapshots.length - 1].netWorth
      : null;

  return (
    <Box sx={{ pb: 10 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
          {t('projections.title')}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.6 }}>
          {t('projections.subtitle')}
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ProjectionControls
            input={input}
            onChange={setParam}
            onInflationToggle={setInflationToggle}
            useRealPerformance={useRealPerformance}
            onRealPerformanceToggle={setUseRealPerformance}
            realCagr={realCagr}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <ProjectionChart data={chartData} showRealValue={input.adjustForInflation} />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <ProjectionSummary
          finalCapital={summary?.finalCapital ?? null}
          totalInterests={summary?.totalInterests ?? null}
          estimatedTaxes={summary?.estimatedTaxes ?? null}
          showRealValue={input.adjustForInflation}
          realFinalCapital={realFinalCapital}
        />
      </Box>
    </Box>
  );
};

export default ProjectionsPage;
