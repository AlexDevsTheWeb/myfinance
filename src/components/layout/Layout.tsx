import { ChevronRight, Home, Menu as MenuIcon } from '@mui/icons-material';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import { AppBar, Box, Breadcrumbs, Button, Container, IconButton, Link as MuiLink, SwipeableDrawer, Toolbar, Typography, useMediaQuery } from '@mui/material';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../../lib/i18n';
import { useAuthStore } from '../../store/useAuthStore';
import type { Transaction } from '../../store/useFinanceStore';
import Sidebar from './Sidebar';
import TransactionModal from '../modals/TransactionModal';
import { VersionFooter } from '../common/VersionFooter';

// Initialize dayjs locale based on current language
dayjs.locale(i18n.language);

const drawerWidth = 240;

const Layout: React.FC<{ children: React.ReactNode; pageTitle?: string; pageDescription?: string }> = ({ children, pageTitle, pageDescription }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isMobile = useMediaQuery('(max-width: 899.95px)');
  const { t } = useTranslation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('expense');
  const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleToggleFab = () => {
    setFabOpen(!fabOpen);
  };

  const handleCloseFab = () => setFabOpen(false);

  const handleFabSelect = (type: 'income' | 'expense') => {
    setTransactionToEdit(null);
    setModalType(type);
    setModalOpen(true);
  };

  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap: { [key: string]: string } = {
    'dashboard': t('navigation.dashboard'),
    'transactions': 'Transactions',
    'config': t('navigation.config'),
    'finance': t('nav.finance'),
    'investments': 'Investments',
    'car': t('car.title'),
    'utilities': t('utilities.title'),
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
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
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.1)' },
        }}
      >
        <Sidebar onNavClick={handleDrawerToggle} />
      </SwipeableDrawer>

      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
        <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Toolbar>
            {isMobile && (
              <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </AppBar>

        <Container maxWidth={false} sx={{ mt: 3, mb: 3, px: { xs: 2, sm: 3, md: 5 }, flexGrow: 1, maxWidth: '100%' }}>
        {user && pathnames.length > 0 && (
          <Breadcrumbs
            separator={<ChevronRight fontSize="small" sx={{ opacity: 0.5 }} />}
            sx={{ mb: 3, color: 'rgba(255,255,255,0.6)' }}
          >
            <MuiLink
              component={Link}
              to="/dashboard"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: 'inherit',
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' },
                fontSize: '0.9rem',
                fontWeight: 600
              }}
            >
              <Home sx={{ mr: 0.5, fontSize: '1.2rem' }} />
              {t('navigation.dashboard')}
            </MuiLink>
            {pathnames.map((value, index) => {
              const last = index === pathnames.length - 1;
              const to = `/${pathnames.slice(0, index + 1).join('/')}`;

              if (value === 'dashboard') return null;

              return last ? (
                <Typography key={to} sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.9rem' }}>
                  {breadcrumbNameMap[value] || value}
                </Typography>
              ) : (
                <MuiLink
                  key={to}
                  component={Link}
                  to={to}
                  sx={{
                    color: 'inherit',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}
                >
                  {breadcrumbNameMap[value] || value}
                </MuiLink>
              );
            })}
          </Breadcrumbs>
        )}
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

      {user && location.pathname !== '/config' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: 'flex',
            flexDirection: 'column-reverse',
            alignItems: 'center',
            gap: 1,
            zIndex: 1000,
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={handleToggleFab}
            sx={{
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(99, 102, 241, 0.4)',
              fontWeight: 800,
              minWidth: 120,
            }}
          >
            +
          </Button>
          {fabOpen && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<ArrowUpward />}
                onClick={() => { handleFabSelect('income'); handleCloseFab(); }}
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                  animation: 'fadeIn 0.2s ease-in',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                {t('common.newIncome')}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<ArrowDownward />}
                onClick={() => { handleFabSelect('expense'); handleCloseFab(); }}
                sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 16px rgba(239, 68, 68, 0.3)',
                  animation: 'fadeIn 0.2s ease-in 0.05s both',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                {t('common.newExpense')}
              </Button>
            </>
          )}
        </Box>
      )}

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        type={modalType}
        transaction={transactionToEdit}
      />
      <VersionFooter />
      </Box>
    </Box>
  );
};

export default Layout;
