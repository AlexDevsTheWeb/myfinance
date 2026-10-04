import { Close as CloseIcon, BarChart as BarChartIcon } from '@mui/icons-material';
import { AppBar, Box, Dialog, IconButton, Toolbar, Typography, useTheme } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { axisClasses } from '@mui/x-charts';

interface SalaryChartDialogProps {
  open: boolean;
  onClose: () => void;
  months: string[];
  series: { data: number[]; label: string; color: string; showMark?: boolean; valueFormatter?: (v: number | null) => string }[];
}

const SalaryChartDialog: React.FC<SalaryChartDialogProps> = ({ open, onClose, months, series }) => {
  const theme = useTheme();

  return (
    <Dialog fullScreen open={open} onClose={onClose}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Toolbar>
          <BarChartIcon sx={{ mr: 1.5, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Monthly Salary Trend
          </Typography>
          <IconButton edge="end" color="inherit" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 3, height: 'calc(100% - 64px)' }}>
        <Box sx={{ height: '100%', width: '100%' }}>
          <LineChart
            series={series.map(s => ({
              ...s,
              showMark: true,
            }))}
            xAxis={[{ scaleType: 'band', data: months, disableLine: true, disableTicks: true }]}
            yAxis={[{ disableLine: true, disableTicks: true }]}
            grid={{ vertical: false, horizontal: true }}
            margin={{ top: 20, right: 40, bottom: 60, left: 80 }}
            sx={{
              '&, & *, & svg': { overflow: 'visible !important' },
              [`.${axisClasses.tickLabel}`]: {
                fill: theme.palette.text.secondary,
                fontSize: 13,
              },
            }}
          />
        </Box>
      </Box>
    </Dialog>
  );
};

export default SalaryChartDialog;
