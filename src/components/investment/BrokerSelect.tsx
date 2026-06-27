import { MenuItem, TextField } from '@mui/material';
import type { BrokerAccount } from '../../store/types';

interface BrokerSelectProps {
  brokers: BrokerAccount[];
  selected: string | 'all';
  onChange: (id: string | 'all') => void;
}

const BrokerSelect: React.FC<BrokerSelectProps> = ({ brokers, selected, onChange }) => (
  <TextField
    select
    size="small"
    value={selected}
    onChange={(e) => onChange(e.target.value)}
    sx={{ minWidth: 200 }}
  >
    <MenuItem value="all">All Brokers (Aggregated)</MenuItem>
    {brokers.map(broker => (
      <MenuItem key={broker.id} value={broker.id}>{broker.name}</MenuItem>
    ))}
  </TextField>
);

export default BrokerSelect;
