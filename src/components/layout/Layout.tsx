import { BarChart as BarChartIcon, DirectionsCar as CarIcon, ChevronRight, Event as DateIcon, AccountBalance as FinanceIcon, Home, KeyboardArrowDown, ExitToApp as LogoutIcon, Settings as SettingsIcon, TrendingUp } from '@mui/icons-material';
import { AppBar, Avatar, Box, Breadcrumbs, Button, Container, Divider, IconButton, Menu, MenuItem, Link as MuiLink, Toolbar, Typography } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLogout } from '../../hooks/useLogout';
import { useAuthStore } from '../../store/useAuthStore';
import { useFinanceStore } from '../../store/useFinanceStore';
import { getEnvVar } from '../../utils/variables.utils';

// Set dayjs to Italian
dayjs.locale('it');

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const { enabledModules } = useFinanceStore();

  const [anchorElFinance, setAnchorElFinance] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenFinance = (event: React.MouseEvent<HTMLElement>) => setAnchorElFinance(event.currentTarget);
  const handleCloseFinance = () => setAnchorElFinance(null);

  const handleOpenUser = (event: React.MouseEvent<HTMLElement>) => setAnchorElUser(event.currentTarget);
  const handleCloseUser = () => setAnchorElUser(null);

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
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
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

          {user && (
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
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
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
