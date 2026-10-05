import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { FOOTER } from '../content/site';
import AllInclusive from '@mui/icons-material/AllInclusive';

/**
 * The export renders these as bare text spans. Text that looks like navigation
 * but is not is worse than no navigation, so anything without a real
 * destination renders as plain muted text instead of a dead link.
 */
const LINK_TARGETS: Record<string, string> = {
  Features: '#features',
  Ecosystem: '#ecosystem',
  Pricing: '#pricing',
  FAQ: '#faq',
  'App ledger & privacy': '#privacy',
  'Sandbox security': '#privacy',
  Custody: '#privacy',
  'Mobile availability': '#ecosystem',
};

export const Footer = () => {
  const theme = useTheme();

  return (
    <Box component="footer" sx={{ backgroundColor: theme.palette.containerLow }}>
      <Container maxWidth="xl">
        <Box sx={{ py: { xs: 6, md: 8 } }}>
          <Box
            sx={{
              display: 'grid',
              gap: 4,
              gridTemplateColumns: { xs: '1fr', md: '1.4fr repeat(3, 1fr)' },
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '4px',
                    backgroundColor: theme.palette.containerHigh,
                    color: theme.palette.primary.main,
                  }}
                >
                  <AllInclusive fontSize="small" />
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Plus Jakarta Sans", sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  Balancr
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 320 }}>
                {FOOTER.blurb}
              </Typography>
              <Typography variant="overline" sx={{ color: theme.palette.secondary.main }}>
                {FOOTER.tagline}
              </Typography>
            </Stack>

            {FOOTER.columns.map((column) => (
              <Stack key={column.title} spacing={1}>
                <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                  {column.title}
                </Typography>
                <Stack component="ul" spacing={0.75} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                  {column.links.map((link) => (
                    <Box component="li" key={link}>
                      {LINK_TARGETS[link] ? (
                        <Link
                          href={LINK_TARGETS[link]}
                          underline="hover"
                          color="text.secondary"
                          sx={{ fontSize: '0.8125rem' }}
                        >
                          {link}
                        </Link>
                      ) : (
                        <Typography
                          sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}
                        >
                          {link}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Stack>
            ))}
          </Box>

          <Divider sx={{ my: 4, borderColor: theme.palette.divider }} />

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {FOOTER.copyright}
            </Typography>
            <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
              {FOOTER.legal.map((item) => (
                <Typography
                  key={item}
                  component="span"
                  sx={{ fontSize: '0.8125rem', color: 'text.disabled' }}
                >
                  {item}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};