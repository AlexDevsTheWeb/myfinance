import { Box, Tooltip, Typography } from '@mui/material';
import { useLegend } from '@mui/x-charts/hooks';

const LegendWithTooltip: React.FC = () => {
  const { items } = useLegend();

  if (items.length === 0) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 1.5,
        px: 1,
        maxWidth: 120,
        overflow: 'hidden',
      }}
    >
      {items.map((item) => (
        <Tooltip key={`${item.seriesId}-${item.dataIndex}`} title={item.label} arrow placement="left">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                backgroundColor: item.color,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.3,
                color: 'text.secondary',
              }}
            >
              {item.label}
            </Typography>
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
};

export default LegendWithTooltip;
