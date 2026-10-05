import { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { useColorMode } from '../theme/colorModeContext';
import { APP_LINKS, NAV_LINKS } from '../content/site';
import AllInclusive from '@mui/icons-material/AllInclusive';
import DarkMode from '@mui/icons-material/DarkMode';
import LightMode from '@mui/icons-material/LightMode';

interface NavbarProps {
  onOpenWaitlist: () => void;
}

export const Navbar = ({ onOpenWaitlist }: NavbarProps) => {
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The drawer is a mobile-only affordance, so it must not survive a resize
  // back to desktop -- otherwise it stays mounted as an invisible overlay
  // swallowing clicks on the page behind it.
  useEffect(() => {
    const query = window.matchMedia('(min-width:1200px)');
    const handle = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) setDrawerOpen(false);
    };
    handle(query);
    query.addEventListener('change', handle);
    return () => query.removeEventListener('change', handle);
  }, []);

  const isDark = mode === 'dark';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.surfaceLowest,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 80 }, gap: 2 }}>
          <Box
            component="a"
            href="#top"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'inherit',
              mr: 'auto',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '4px',
                display: 'grid',
                placeItems: 'center',
                backgroundColor: theme.palette.container,
                color: theme.palette.primary.main,
                flexShrink: 0,
              }}
            >
              <AllInclusive fontSize="small" />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <Typography
                sx={{
                  fontFamily: '"Plus Jakarta Sans", sans-serif',
                  fontSize: '1rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Balancr
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.5625rem',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                }}
              >
                Private Wealth
              </Typography>
            </Box>
          </Box>

          <List
            component="nav"
            aria-label="Main"
            sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: 'row', gap: 3, p: 0 }}
          >
            {NAV_LINKS.map((link) => (
              <ListItem key={link.href} disablePadding sx={{ py: 0 }}>
                <Typography
                  component="a"
                  href={link.href}
                  sx={{
                    color: 'text.secondary',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  {link.label}
                </Typography>
              </ListItem>
            ))}
          </List>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={toggleColorMode}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
              size="small"
              sx={{
                width: 36,
                height: 36,
                borderRadius: '4px',
                backgroundColor: theme.palette.containerLow,
                color: 'text.secondary',
                '&:hover': { backgroundColor: theme.palette.container, color: 'text.primary' },
              }}
            >
              {isDark ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>

            <Button
              href={APP_LINKS.signIn}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'text.secondary' }}
            >
              Sign in
            </Button>

            <Button
              variant="contained"
              onClick={onOpenWaitlist}
              sx={{ px: 2, height: 44 }}
            >
              Start free trial
            </Button>

            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              sx={{ display: { xs: 'inline-flex', lg: 'none' }, color: 'text.primary' }}
            >
              <Box
                component="span"
                sx={{
                  display: 'block',
                  width: 20,
                  height: 2,
                  backgroundColor: 'currentColor',
                  boxShadow: '0 6px 0 currentColor, 0 -6px 0 currentColor',
                }}
              />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      <Drawer
        id="mobile-nav-drawer"
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: { width: 260, backgroundColor: theme.palette.containerLow },
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="overline" color="text.secondary">
            Navigate
          </Typography>
          <Divider sx={{ my: 1.5 }} />
          <List>
            {NAV_LINKS.map((link) => (
              <ListItem key={link.href} disablePadding sx={{ py: 0.75 }}>
                <Typography
                  component="a"
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  sx={{ color: 'text.primary', textDecoration: 'none', fontWeight: 600 }}
                >
                  {link.label}
                </Typography>
              </ListItem>
            ))}
          </List>
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => {
              setDrawerOpen(false);
              onOpenWaitlist();
            }}
          >
            Start free trial
          </Button>
        </Box>
      </Drawer>
    </AppBar>
  );
};