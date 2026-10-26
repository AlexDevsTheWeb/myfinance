import { Add, Menu as MenuIcon } from '@mui/icons-material';
import { AppBar, Box, Container, Fab, IconButton, SwipeableDrawer, Toolbar, useMediaQuery } from '@mui/material';
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

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        {!isMobile && <TopBar />}
        <Container
          maxWidth={false}
          disableGutters
          sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 }, flexGrow: 1, maxWidth: '100%' }}
        >
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
