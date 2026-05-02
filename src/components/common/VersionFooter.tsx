import React from 'react';
import { Box, Typography } from '@mui/material';
import { version, commit } from '../../version';

export const VersionFooter: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 1,
        px: 2,
        textAlign: 'center',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        v{version}
        {import.meta.env.DEV && ` • ${commit}`}
      </Typography>
    </Box>
  );
};