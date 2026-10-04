import { Box, Button } from '@mui/material';
import React from 'react';

interface YearSelectorProps {
  availableYears: number[];
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export const YearSelector: React.FC<YearSelectorProps> = ({ availableYears, selectedYear, onYearChange }) => {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {availableYears.map(y => (
        <Button
          key={y}
          variant={selectedYear === y ? "contained" : "outlined"}
          size="small"
          onClick={() => onYearChange(y)}
          sx={{ borderRadius: 2, minWidth: 80 }}
        >
          {y}
        </Button>
      ))}
    </Box>
  );
};
