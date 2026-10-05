import { useId, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import Lock from '@mui/icons-material/Lock';
import TrendingUp from '@mui/icons-material/TrendingUp';

interface CockpitPreviewProps {
  sx?: object;
  /** Anchor target for the hero's "explore the cockpit" CTA. */
  id?: string;
}

interface LedgerRow {
  label: string;
  amount: string;
  delta: string;
  positive: boolean;
}

const OVERVIEW_ROWS: LedgerRow[] = [
  { label: 'Protected operating liquidity', amount: '€ 27,075.42', delta: '+4.2%', positive: true },
  { label: 'ETF & productive investments', amount: '€ 84,800.00', delta: '+11.8%', positive: true },
  { label: 'Emergency reserve capital', amount: '€ 15,000.00', delta: '0.0%', positive: false },
];

const TRANSACTION_ROWS: LedgerRow[] = [
  { label: 'YouTube Music & Premium', amount: '€ 11.99', delta: 'in 3 days', positive: false },
  { label: 'Car finance instalment', amount: '€ 241.85', delta: 'scheduled', positive: false },
  { label: 'Condominium elevator levy', amount: '€ 498.93', delta: 'one-off', positive: false },
  { label: 'Payroll deposit', amount: '€ 3,200.00', delta: 'received', positive: true },
];

/**
 * Static, interactive-look illustration of the product cockpit.
 *
 * This is marketing chrome, not the app. Everything in it is hardcoded sample
 * data -- there is no API behind it and the ledger is not real. The tab switch
 * is genuine UI state so the demo behaves like the thing it advertises.
 */
export const CockpitPreview = ({ sx, id }: CockpitPreviewProps) => {
  const theme = useTheme();
  const [tab, setTab] = useState<'overview' | 'transactions'>('overview');
  const panelId = useId();

  const rows = tab === 'overview' ? OVERVIEW_ROWS : TRANSACTION_ROWS;

  return (
    <Box
      component="figure"
      id={id}
      aria-label="Illustration of the Balancr cockpit"
      sx={{
        m: 0,
        borderRadius: '8px',
        backgroundColor: theme.palette.surfaceLowest,
        border: `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
        textAlign: 'left',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          px: 2,
          py: 1.25,
          backgroundColor: theme.palette.container,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Stack direction="row" spacing={0.75}>
            {(['error', 'secondary', 'success'] as const).map((tone) => (
              <Box
                key={tone}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: theme.palette[tone].main,
                  opacity: 0.85,
                }}
              />
            ))}
          </Stack>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center', display: { xs: 'none', sm: 'flex' } }}
          >
            <Lock sx={{ fontSize: 15, color: theme.palette.primary.main }} />
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
            >
              vault.balancr.finance/cockpit/portfolio
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Typography
            variant="overline"
            sx={{
              display: { xs: 'none', md: 'block' },
              px: 1,
              py: 0.25,
              borderRadius: '4px',
              backgroundColor: theme.palette.containerHighest,
              color: 'text.secondary',
              fontSize: '0.6875rem',
            }}
          >
            Test environment active
          </Typography>
          <Tabs
            value={tab}
            onChange={(_event, value: 'overview' | 'transactions') => setTab(value)}
            aria-label="Cockpit demo view"
            sx={{
              minHeight: 32,
              p: 0.25,
              borderRadius: '4px',
              backgroundColor: theme.palette.containerHigh,
              '& .MuiTab-root': {
                minHeight: 28,
                minWidth: 0,
                px: 1.5,
                py: 0,
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'none',
              },
            }}
          >
            <Tab value="overview" label="Overview" id={`${panelId}-overview`} />
            <Tab value="transactions" label="Transactions" id={`${panelId}-transactions`} />
          </Tabs>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 2 }}
        >
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              {tab === 'overview' ? 'Liquid capital total' : 'Movements this month'}
            </Typography>
            <Typography variant="h3">
              {tab === 'overview' ? '€ 27,075.42' : '4 entries'}
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center', color: theme.palette.secondary.main }}
          >
            <TrendingUp fontSize="small" />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {tab === 'overview' ? '14 months of expense coverage' : 'Recurrences auto-detected'}
            </Typography>
          </Stack>
        </Stack>

        <Box
          component="ul"
          sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column' }}
        >
          {rows.map((row) => (
            <Box
              component="li"
              key={row.label}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                py: 1.25,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body1" sx={{ color: 'text.primary' }}>
                {row.label}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {row.delta}
                </Typography>
                <Typography variant="body1" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {row.amount}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        component="figcaption"
        sx={{
          px: { xs: 2, md: 3 },
          py: 1.25,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.containerLow,
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Illustrative sample data. The numbers above are not a real ledger.
        </Typography>
      </Box>
    </Box>
  );
};