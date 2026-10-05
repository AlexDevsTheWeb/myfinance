import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { PILLARS, type Pillar } from '../content/site';
import { Icon } from './Icon';

const SECTION_COPY = {
  eyebrow: 'Designed for precision',
  title: 'Three pillars to govern your financial flow',
  lead: 'Retire the scattered spreadsheets and the disconnected banking apps. Balancr centralises what actually matters into a surgical interface.',
} as const;

const MockPanel = ({ pillar }: { pillar: Pillar }) => {
  const theme = useTheme();
  const mock = pillar.mock;
  if (!mock) return null;

  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: '8px',
        backgroundColor: theme.palette.container,
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {mock.label}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', gap: 1, mb: 2 }}>
        <Typography variant="h2" sx={{ fontSize: '2rem' }}>
          {mock.value}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
        {mock.caption}
      </Typography>

      <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
        {mock.rows.map((row) => (
          <Box
            component="li"
            key={row.label}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              py: 1,
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                {row.label}
              </Typography>
              {row.note && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {row.note}
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {row.amount}
            </Typography>
          </Box>
        ))}
      </Box>

      <Stack
        direction="row"
        sx={{ justifyContent: 'space-between', pt: 1.5, mt: 0.5, borderTop: `1px solid ${theme.palette.divider}` }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {mock.total.label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
          {mock.total.value}
        </Typography>
      </Stack>
    </Box>
  );
};

export const PillarsSection = () => {
  const theme = useTheme();

  return (
    <Box component="section" id="features" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="xl">
        <Stack spacing={2} sx={{ maxWidth: 720, mb: 6 }}>
          <Typography variant="overline" sx={{ color: 'text.secondary' }}>
            {SECTION_COPY.eyebrow}
          </Typography>
          <Typography variant="h2" id="features-title">
            {SECTION_COPY.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
            {SECTION_COPY.lead}
          </Typography>
        </Stack>

        <Stack spacing={4}>
          {PILLARS.map((pillar) => (
            <Box
              key={pillar.id}
              component="article"
              aria-labelledby={`${pillar.id}-title`}
              sx={{
                display: 'grid',
                gap: 3,
                p: { xs: 2.5, md: 4 },
                borderRadius: '8px',
                backgroundColor: theme.palette.surfaceLowest,
                border: `1px solid ${theme.palette.divider}`,
                gridTemplateColumns: { xs: '1fr', lg: '1.1fr 1fr' },
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'grid',
                      placeItems: 'center',
                      borderRadius: '4px',
                      backgroundColor: theme.palette.containerHigh,
                      color: theme.palette.secondary.main,
                      flexShrink: 0,
                    }}
                  >
                    <Icon name={pillar.icon} />
                  </Box>
                  <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                    {pillar.eyebrow}
                  </Typography>
                </Stack>

                <Typography variant="h3" id={`${pillar.id}-title`}>
                  {pillar.title}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  {pillar.body}
                </Typography>

                <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, mt: 0.5 }}>
                  {pillar.features.map((feature) => (
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
              </Stack>

              <MockPanel pillar={pillar} />
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};