import { Add, Menu as MenuIcon } from '@mui/icons-material';
import { AppBar, Box, Container, Fab, IconButton, SwipeableDrawer, Toolbar, Typography, useMediaQuery } from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import i18n from '../../lib/i18n';
import { useAuthStore } from '../../store/useAuthStore';
import { useUiStore } from '../../store/useUiStore';
import { VersionFooter } from '../common/VersionFooter';
import AddTransactionDrawer from '../transactions/AddTransactionDrawer';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

// Initialize dayjs locale based on current language
dayjs.locale(i18n.language);

const drawerWidth = 240;

const Layout: React.FC<{ children: React.ReactNode; pageTitle?: string; pageDescription?: string }> = ({ children, pageTitle, pageDescription }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 899.95px)');
  const { t } = useTranslation();

  const [mobileOpen, setMobileOpen] = useState(false);

  const openTransactionDrawer = useUiStore((s) => s.openTransactionDrawer);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/dashboard/';


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'colors.bg' }}>
      {/* Desktop Sidebar (permanent) */}
      {!isMobile && <Sidebar />}

      {/* Mobile Drawer (temporary) */}
      <SwipeableDrawer
        variant="temporary"
        open={mobileOpen}
        onOpen={handleDrawerToggle}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: 'background.default', borderRight: '1px solid rgba(255,255,255,0.1)' },
        }}
      >
        <Sidebar onNavClick={handleDrawerToggle} />
      </SwipeableDrawer>

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
        {isMobile && (
          <AppBar position="sticky" elevation={0} sx={{ background: 'colors.sidebar', borderBottom: '1px solid', borderColor: 'colors.border' }}>
            <Toolbar>
              <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
        )}
        {!isDashboard && !isMobile && <TopBar />}
        <Container
          maxWidth={false}
          disableGutters
          sx={
            isDashboard
              ? { p: 0, m: 0, flexGrow: 1, maxWidth: '100%' }
              : { mt: 3, mb: 3, px: { xs: 2, sm: 3, md: 5 }, flexGrow: 1, maxWidth: '100%' }
          }
        >
          {pageTitle && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -1 }}>
                {pageTitle}
              </Typography>
              {pageDescription && (
                <Typography variant="body1" sx={{ opacity: 0.6 }}>
                  {pageDescription}
                </Typography>
              )}
            </Box>
          )}
          {children}
        </Container>

        {user && location.pathname !== '/config' && !isDashboard && (
          <Fab
            color="primary"
            aria-label={t('transactions.drawer.fabLabel')}
            onClick={() => openTransactionDrawer('expense')}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              bgcolor: 'colors.surface',
              color: 'colors.cyan',
              border: '1px solid',
              borderColor: 'colors.cyan',
              boxShadow: '0 8px 24px rgba(6,182,212,0.25)',
              '&:hover': { bgcolor: 'colors.active' },
            }}
          >
            <Add />
          </Fab>
        )}

        <AddTransactionDrawer />
        <VersionFooter />
      </Box>
    </Box>
  );
};

export default Layout;
