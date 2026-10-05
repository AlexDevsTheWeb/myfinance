import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import {
  ANNUAL_DISCOUNT,
  BILLING_CYCLE_LABELS,
  PLANS,
  PRO_PRICES,
  type BillingCycle,
  type Plan,
} from '../content/site';
import { Icon } from './Icon';

interface PricingTableProps {
  cycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
  onSelectPlan: (plan: Plan) => void;
}

const SECTION_COPY = {
  eyebrow: 'Transparent plans',
  title: 'Choose how you access Balancr',
  lead: 'A flexible SaaS subscription, or a one-time Founder perpetual licence. No hidden costs.',
} as const;

const PlanCard = ({
  plan,
  cycle,
  onSelectPlan,
}: {
  plan: Plan;
  cycle: BillingCycle;
  onSelectPlan: (plan: Plan) => void;
}) => {
  const theme = useTheme();
  const highlighted = Boolean(plan.highlighted);

  // One lookup, one source of truth. The export hardcoded the same figure into
  // three separate DOM writes inside setBillingCycle(), which is how the Pro
  // price could drift out of sync with its own period label.
  const price =
    plan.fixedPrice ??
    (cycle === 'lifetime' ? PRO_PRICES.lifetime : PRO_PRICES[cycle]);

  // Starter is free on every cycle, so a lifetime selection must not imply it
  // costs something.
  const isPro = plan.id === 'pro';
  const showCyclePricing = isPro;

  return (
    <Box
      component="article"
      aria-labelledby={`${plan.id}-title`}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        p: 3,
        height: '100%',
        borderRadius: '8px',
        backgroundColor: highlighted ? theme.palette.container : theme.palette.surfaceLowest,
        border: `1px solid ${
          highlighted ? theme.palette.primary.main : theme.palette.divider
        }`,
      }}
    >
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minHeight: 24 }}>
        <Typography variant="h3" id={`${plan.id}-title`}>
          {plan.name}
        </Typography>
        {plan.badge && (
          <Box
            component="span"
            sx={{
              px: 1,
              py: 0.25,
              borderRadius: '4px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              backgroundColor: highlighted
                ? theme.palette.primary.main
                : theme.palette.containerHigh,
              color: highlighted ? theme.palette.primary.contrastText : 'text.secondary',
            }}
          >
            {plan.badge}
          </Box>
        )}
      </Stack>

      <Typography variant="body2" sx={{ color: 'text.secondary', minHeight: 44 }}>
        {plan.tagline}
      </Typography>

      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontSize: '2.25rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            {showCyclePricing ? PRO_PRICES[cycle].amount : price.amount}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {showCyclePricing ? PRO_PRICES[cycle].period : price.period}
          </Typography>
        </Stack>
        {(showCyclePricing ? PRO_PRICES[cycle].note : price.note) && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {(showCyclePricing ? PRO_PRICES[cycle].note : price.note) as string}
          </Typography>
        )}
      </Box>

      <Button
        variant={plan.cta.variant}
        onClick={() => onSelectPlan(plan)}
        fullWidth
        sx={{ height: 44 }}
      >
        {plan.cta.label}
      </Button>

      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {plan.features.map((feature) => (
          <Box
            component="li"
            key={feature.label}
            sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', py: 0.5 }}
          >
            <Icon
              name={feature.included ? 'checkCircle' : 'close'}
              sx={{
                fontSize: 18,
                mt: 0.25,
                color: feature.included ? theme.palette.secondary.main : 'text.disabled',
              }}
            />
            <Typography
              variant="body2"
              sx={{
                color: feature.included ? 'text.secondary' : 'text.disabled',
                textDecoration: feature.included ? 'none' : 'line-through',
              }}
            >
              {feature.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export const PricingTable = ({
  cycle,
  onCycleChange,
  onSelectPlan,
}: PricingTableProps) => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="pricing"
      sx={{ py: { xs: 8, md: 12 }, backgroundColor: theme.palette.containerLow }}
    >
      <Container maxWidth="xl">
        <Stack spacing={2} sx={{ maxWidth: 720, mb: 4 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {SECTION_COPY.eyebrow}
          </Typography>
          <Typography variant="h2" id="pricing-title">
            {SECTION_COPY.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            {SECTION_COPY.lead}
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{ alignItems: { sm: 'center' }, mb: 4, flexWrap: 'wrap' }}
        >
          <ToggleButtonGroup
            exclusive
            value={cycle}
            onChange={(_event, value: BillingCycle | null) => {
              // null arrives when the active button is clicked again; keeping the
              // current cycle is friendlier than collapsing the whole selection.
              if (value) onCycleChange(value);
            }}
            aria-label="Billing cycle"
            sx={{
              '& .MuiToggleButton-root': {
                px: 2.5,
                py: 1,
                borderRadius: '4px',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                borderColor: theme.palette.divider,
                color: 'text.secondary',
              },
              '& .Mui-selected': {
                backgroundColor: `${theme.palette.primary.main} !important`,
                color: `${theme.palette.primary.contrastText} !important`,
              },
            }}
          >
            {(Object.keys(BILLING_CYCLE_LABELS) as BillingCycle[]).map((key) => (
              <ToggleButton key={key} value={key} aria-label={BILLING_CYCLE_LABELS[key]}>
                {BILLING_CYCLE_LABELS[key]}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {cycle === 'annual' && (
            <Typography variant="body2" sx={{ color: theme.palette.secondary.main, fontWeight: 600 }}>
              {ANNUAL_DISCOUNT} on Pro
            </Typography>
          )}
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            alignItems: 'stretch',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} cycle={cycle} onSelectPlan={onSelectPlan} />
          ))}
        </Box>
      </Container>
    </Box>
  );
};