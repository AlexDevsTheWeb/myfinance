import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { ECOSYSTEM } from '../content/site';
import ArrowForward from '@mui/icons-material/ArrowForward';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { Icon } from './Icon';

interface EcosystemSectionProps {
  onOpenWaitlist: () => void;
}

export const EcosystemSection = ({ onOpenWaitlist }: EcosystemSectionProps) => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="ecosystem"
      sx={{ py: { xs: 8, md: 12 }, backgroundColor: theme.palette.containerLow }}
    >
      <Container maxWidth="xl">
        <Stack spacing={2} sx={{ maxWidth: 720, mb: 6 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {ECOSYSTEM.eyebrow}
          </Typography>
          <Typography variant="h2" id="ecosystem-title">
            {ECOSYSTEM.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            {ECOSYSTEM.lead}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          }}
        >
          {ECOSYSTEM.platforms.map((platform) => {
            const isAvailable = platform.statusTone === 'available';
            // `ECOSYSTEM` is a heterogeneous `as const` tuple, so `href` only
            // exists on the platform that actually has a live destination.
            const href = 'href' in platform.action ? platform.action.href : undefined;
            return (
              <Box
                key={platform.id}
                component="article"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  p: 3,
                  borderRadius: '8px',
                  backgroundColor: theme.palette.container,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '4px',
                      backgroundColor: theme.palette.containerHigh,
                      color: theme.palette.primary.main,
                    }}
                  >
                    <Icon name={platform.icon} />
                  </Box>
                  <Chip
                    label={platform.status}
                    size="small"
                    sx={{
                      borderRadius: '4px',
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      backgroundColor: isAvailable
                        ? theme.palette.containerHigh
                        : theme.palette.containerHighest,
                      color: isAvailable ? theme.palette.secondary.main : 'text.secondary',
                    }}
                  />
                </Stack>

                <Typography variant="h3">{platform.title}</Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', flexGrow: 1 }}>
                  {platform.body}
                </Typography>

                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
                  {platform.features.map((feature) => (
                    <Box
                      component="li"
                      key={feature}
                      sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', py: 0.5 }}
                    >
                      <Icon
                        name="checkCircle"
                        sx={{ fontSize: 18, mt: 0.25, color: theme.palette.secondary.main }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {feature}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Only the shipped web platform has a live destination. The two
                    beta platforms open the waitlist instead of pointing at store
                    pages that do not exist yet. */}
                {isAvailable ? (
                  <Button
                    variant="contained"
                    component="a"
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNew fontSize="small" />}
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                  >
                    {platform.action.label}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    onClick={onOpenWaitlist}
                    endIcon={<ArrowForward fontSize="small" />}
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                  >
                    {platform.action.label}
                  </Button>
                )}
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};