import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { HERO } from '../content/site';
import ArrowForward from '@mui/icons-material/ArrowForward';
import { Icon } from './Icon';
import { CockpitPreview } from './CockpitPreview';

interface HeroSectionProps {
  onOpenWaitlist: () => void;
}

export const HeroSection = ({ onOpenWaitlist }: HeroSectionProps) => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="top"
      sx={{
        py: { xs: 8, md: 12 },
        // The export paints a 1000x450 blurred gradient behind the hero. The
        // brief asks for solid surfaces with no decorative glow, so it is not
        // reproduced. Section separation comes from the container ramp instead.
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Chip
            icon={
              <Box
                component="span"
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.secondary.main,
                }}
              />
            }
            label={HERO.statusPill}
            sx={{
              height: 'auto',
              py: 0.75,
              px: 2,
              borderRadius: '4px',
              backgroundColor: theme.palette.containerHigh,
              color: theme.palette.primary.main,
              fontSize: '0.75rem',
              fontWeight: 600,
              '& .MuiChip-icon': { ml: 1, mr: -0.5 },
            }}
          />

          <Typography
            variant="h1"
            sx={{ maxWidth: 900, color: 'text.primary' }}
          >
            {HERO.headlineLead}{' '}
            {/* The only gradient kept from the export: it carries brand colour
                on the accent phrase rather than decorating the background. */}
            <Box
              component="span"
              sx={{
                backgroundImage: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              {HERO.headlineAccent}
            </Box>
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{ maxWidth: 640, color: 'text.secondary' }}
          >
            {HERO.subhead}
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ mt: 2, width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={onOpenWaitlist}
              endIcon={<ArrowForward fontSize="small" />}
              sx={{ px: 4, height: 48 }}
            >
              {HERO.primaryCta}
            </Button>
            <Button
              variant="outlined"
              size="large"
              href="#cockpit"
              startIcon={<Icon name="trendingUp" fontSize="small" />}
              sx={{
                px: 4,
                height: 48,
                borderColor: theme.palette.divider,
                color: 'text.primary',
                backgroundColor: theme.palette.containerHigh,
              }}
            >
              {HERO.secondaryCta}
            </Button>
          </Stack>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {HERO.trialNotice}
          </Typography>

          <Stack
            id="how-it-works"
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 4 }}
            sx={{
              mt: 4,
              pt: 3,
              px: 3,
              width: '100%',
              maxWidth: 720,
              borderRadius: '8px',
              backgroundColor: theme.palette.surfaceLowest,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {HERO.trustBar.map((item) => (
              <Stack
                key={item.label}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon
                  name={item.icon}
                  fontSize="small"
                  sx={{ color: theme.palette.secondary.main }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {item.label}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <CockpitPreview sx={{ mt: 6, width: '100%' }} id="cockpit" />
        </Stack>
      </Container>
    </Box>
  );
};