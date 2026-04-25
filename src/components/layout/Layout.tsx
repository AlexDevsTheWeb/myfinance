import { BarChart as BarChartIcon, DirectionsCar as CarIcon, ChevronRight, Event as DateIcon, Bolt as ElecIcon, AccountBalance as FinanceIcon, Home, KeyboardArrowDown, ExitToApp as LogoutIcon, Menu as MenuIcon, Settings as SettingsIcon, TrendingUp } from '@mui/icons-material';
import { AppBar, Avatar, Box, Breadcrumbs, Button, Container, Divider, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, Link as MuiLink, SwipeableDrawer, Toolbar, Typography, useMediaQuery, useTheme } from '@mui/material';
import { ArrowDownward, ArrowUpward } from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogout } from '../../hooks/useLogout';
import { useAuthStore } from '../../store/useAuthStore';
import { useFinanceStore, type Transaction } from '../../store/useFinanceStore';
import { getEnvVar } from '../../utils/variables.utils';
import TransactionModal from '../modals/TransactionModal';

// Set dayjs to Italian
dayjs.locale('it');

const drawerWidth = 240;

const Layout: React.FC<{ children: React.ReactNode; pageTitle?: string; pageDescription?: string }> = ({ children, pageTitle, pageDescription }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { enabledModules } = useFinanceStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElFinance, setAnchorElFinance] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
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

  const handleOpenFinance = (event: React.MouseEvent<HTMLElement>) => setAnchorElFinance(event.currentTarget);
  const handleCloseFinance = () => setAnchorElFinance(null);

  const handleOpenUser = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseUser = () => setAnchorElUser(null);

  const handleFabSelect = (type: 'income' | 'expense') => {
    setTransactionToEdit(null);
    setModalType(type);
    setModalOpen(true);
  };

  const logout = useLogout();

  const handleLogout = () => {
    handleCloseUser();
    logout();
  };

  const appTitle = getEnvVar('VITE_REACT_APP_TITLE');
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap: { [key: string]: string } = {
    'dashboard': 'Dashboard',
    'transactions': 'Transactions',
    'config': 'Config',
    'salary': 'Salary Analysis',
    'analysis': 'Detailed Analysis',
    'car': 'Gestione Auto',
    'utilities': 'Utenze',
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2, color: '#6366f1', fontWeight: 800 }}>
        {appTitle}
      </Typography>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      <List>
        <ListItemButton component={Link} to="/dashboard">
          <ListItemIcon><Home sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
          <ListItemText primary="Dashboard" sx={{ color: 'white' }} />
        </ListItemButton>
        <ListItemButton onClick={() => { navigate('/salary'); }}>
          <ListItemIcon><TrendingUp sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
          <ListItemText primary="Salary Analysis" sx={{ color: 'white' }} />
        </ListItemButton>
        <ListItemButton onClick={() => { navigate('/analysis'); }}>
          <ListItemIcon><BarChartIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
          <ListItemText primary="Detailed Analysis" sx={{ color: 'white' }} />
        </ListItemButton>
        {enabledModules?.carManagement && (
          <ListItemButton component={Link} to="/car">
            <ListItemIcon><CarIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
            <ListItemText primary="Auto" sx={{ color: 'white' }} />
          </ListItemButton>
        )}
        {enabledModules?.utilityTracker && (
          <ListItemButton component={Link} to="/utilities">
            <ListItemIcon><ElecIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
            <ListItemText primary="Utenze" sx={{ color: 'white' }} />
          </ListItemButton>
        )}
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <ListItemButton onClick={() => { navigate('/config'); }}>
          <ListItemIcon><SettingsIcon sx={{ color: 'rgba(255,255,255,0.7)' }} /></ListItemIcon>
          <ListItemText primary="Impostazioni" sx={{ color: 'white' }} />
        </ListItemButton>
        <ListItemButton onClick={handleLogout}>
          <ListItemIcon><LogoutIcon sx={{ color: '#ef4444' }} /></ListItemIcon>
          <ListItemText primary="Logout" sx={{ color: '#ef4444' }} />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            component={Link}
            to="/dashboard"
            sx={{
              fontWeight: 800,
              letterSpacing: -1,
              color: '#6366f1',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <FinanceIcon />
            {appTitle}
          </Typography>

          {user && !isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Finance Dropdown */}
              <Button
                color="inherit"
                onClick={handleOpenFinance}
                endIcon={<KeyboardArrowDown />}
                startIcon={<FinanceIcon />}
                sx={{ borderRadius: 2, px: 2 }}
              >
                Finance
              </Button>
              <Menu
                anchorEl={anchorElFinance}
                open={Boolean(anchorElFinance)}
                onClose={handleCloseFinance}
                PaperProps={{
                  sx: { background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', mt: 1.5, minWidth: 180 }
                }}
              >
                <MenuItem onClick={() => { navigate('/salary'); handleCloseFinance(); }}>
                  <TrendingUp sx={{ mr: 1.5, fontSize: 20, opacity: 0.7 }} /> Salary Analysis
                </MenuItem>
                <MenuItem onClick={() => { navigate('/analysis'); handleCloseFinance(); }}>
                  <BarChartIcon sx={{ mr: 1.5, fontSize: 20, opacity: 0.7 }} /> Detailed Analysis
                </MenuItem>
              </Menu>

              {/* Other direct links */}
              {enabledModules?.carManagement && (
                <Button
                  color="inherit"
                  component={Link}
                  to="/car"
                  startIcon={<CarIcon />}
                  sx={{ borderRadius: 2, px: 2 }}
                >
                  Auto
                </Button>
              )}
              {enabledModules?.utilityTracker && (
                <Button
                  color="inherit"
                  component={Link}
                  to="/utilities"
                  startIcon={<ElecIcon />}
                  sx={{ borderRadius: 2, px: 2 }}
                >
                  Utenze
                </Button>
              )}

              {/* User Profile Avatar */}
              <IconButton onClick={handleOpenUser} sx={{ ml: 1, p: 0.5 }}>
                <Avatar
                  src={user.photoURL || undefined}
                  alt={user.displayName || 'User'}
                  sx={{ width: 36, height: 36, border: '2px solid rgba(99, 102, 241, 0.5)' }}
                >
                  {user.displayName?.charAt(0)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUser}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    background: '#1e293b',
                    border: '1px solid rgba(255,255,255,0.1)',
                    mt: 1.5,
                    minWidth: 220,
                    '& .MuiMenuItem-root': { fontSize: '0.9rem' }
                  }
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#818cf8' }}>
                    {user.displayName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, opacity: 0.6 }}>
                    <DateIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                      {dayjs().format('dddd, D MMMM')}
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                <MenuItem onClick={() => { navigate('/config'); handleCloseUser(); }}>
                  <SettingsIcon sx={{ mr: 1.5, fontSize: 18, opacity: 0.7 }} /> Impostazioni
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: '#ef4444' }}>
                  <LogoutIcon sx={{ mr: 1.5, fontSize: 18, opacity: 0.7 }} /> Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="mailbox folders"
      >
        <SwipeableDrawer
          variant="temporary"
          open={mobileOpen}
          onOpen={handleDrawerToggle}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.1)' },
          }}
        >
          {drawer}
        </SwipeableDrawer>
      </Box>
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
              Dashboard
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
                New Income
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
                New Expense
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
    </Box>
  );
};

export default Layout;
