import { Box, Button, FormControl, InputLabel, MenuItem, Select, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import type { Granularity } from '../types';

interface AnalyticsFiltersProps {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  granularity: Granularity;
  category?: string;
  categories?: string[];
  onStartDateChange: (d: Dayjs | null) => void;
  onEndDateChange: (d: Dayjs | null) => void;
  onGranularityChange: (g: Granularity) => void;
  onCategoryChange?: (c: string) => void;
  onClear?: () => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  startDate, endDate, granularity, category, categories,
  onStartDateChange, onEndDateChange, onGranularityChange,
  onCategoryChange, onClear,
}) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
        <DatePicker
          label="From"
          value={startDate}
          onChange={(v) => onStartDateChange(v)}
          slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
        />
        <DatePicker
          label="To"
          value={endDate}
          onChange={(v) => onEndDateChange(v)}
          slotProps={{ textField: { size: 'small', sx: { minWidth: 160 } } }}
        />

        <ToggleButtonGroup
          value={granularity}
          exclusive
          onChange={(_, val) => val && onGranularityChange(val)}
          size="small"
        >
          <ToggleButton value="monthly">Monthly</ToggleButton>
          <ToggleButton value="yearly">Yearly</ToggleButton>
          <ToggleButton value="total">Total</ToggleButton>
        </ToggleButtonGroup>

        {categories && onCategoryChange && (
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category || 'all'}
              label="Category"
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map(c => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {onClear && (
          <Button size="small" variant="outlined" onClick={onClear} sx={{ borderRadius: 2 }}>
            Clear
          </Button>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default AnalyticsFilters;
