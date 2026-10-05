import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { SECURITY } from '../content/site';
import { Icon } from './Icon';

export const SecuritySection = () => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="privacy"
      sx={{ py: { xs: 8, md: 12 }, backgroundColor: theme.palette.containerLow }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gap: 4,
            p: { xs: 3, md: 5 },
            borderRadius: '8px',
            backgroundColor: theme.palette.surfaceLowest,
            border: `1px solid ${theme.palette.divider}`,
            gridTemplateColumns: { xs: '1fr', lg: '1fr 1.2fr' },
          }}
        >
          <Stack spacing={2}>
            <Typography variant="overline" sx={{ color: 'text.secondary' }}>
              {SECURITY.eyebrow}
            </Typography>
            <Typography variant="h2" id="privacy-title">
              {SECURITY.title}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              {SECURITY.body}
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gap: 1.5,
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                mt: 1,
              }}
            >
              {SECURITY.spec.map((spec) => (
                <Box
                  key={spec.label}
                  sx={{
                    p: 1.5,
                    borderRadius: '4px',
                    backgroundColor: theme.palette.container,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                    {spec.label}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
                  >
                    {spec.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Stack>

          <Stack spacing={2}>
            {SECURITY.cards.map((card) => (
              <Box
                key={card.title}
                component="article"
                sx={{
                  display: 'flex',
                  gap: 2,
                  p: 2.5,
                  borderRadius: '8px',
                  backgroundColor: theme.palette.container,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '4px',
                    backgroundColor: theme.palette.containerHighest,
                    color: theme.palette.secondary.main,
                    flexShrink: 0,
                  }}
                >
                  <Icon name={card.icon} />
                </Box>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {card.body}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};