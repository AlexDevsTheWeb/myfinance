import { Box, Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProjectionChart from '../components/projections/ProjectionChart';
import ProjectionControls from '../components/projections/ProjectionControls';
import ProjectionSummary from '../components/projections/ProjectionSummary';
import { useProjections } from '../hooks/useProjections';

const ProjectionsPage: React.FC = () => {
  const { input, summary, chartData, setParam, setInflationToggle } = useProjections();
  const { t } = useTranslation();

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
          />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <ProjectionChart data={chartData} />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <ProjectionSummary
          finalCapital={summary?.finalCapital ?? null}
          totalInterests={summary?.totalInterests ?? null}
          estimatedTaxes={summary?.estimatedTaxes ?? null}
        />
      </Box>
    </Box>
  );
};

export default ProjectionsPage;
