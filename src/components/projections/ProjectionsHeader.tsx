import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ProjectionsHeader: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
      {t('projections.title')}
    </Typography>
  );
};

export default ProjectionsHeader;
