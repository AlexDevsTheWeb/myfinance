import { BarChart as BarChartIcon, ChevronRight, Dashboard as DashboardIcon, Home, ExitToApp as LogoutIcon, Settings as SettingsIcon, TrendingUp } from '@mui/icons-material';
import { AppBar, Box, Breadcrumbs, Button, Container, IconButton, Link as MuiLink, Toolbar, Typography } from '@mui/material';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';
import { getEnvVar } from '../../utils/variables.utils';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const appTitle = getEnvVar('VITE_REACT_APP_TITLE');
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Breadcrumb mapping
  const breadcrumbNameMap: { [key: string]: string } = {
    'dashboard': 'Dashboard',
    'transactions': 'Transactions',
    'config': 'Config',
    'salary': 'Salary Analysis',
    'analysis': 'Detailed Analysis',
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: -0.5, color: '#6366f1' }}>
            {appTitle}
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={Link} to="/dashboard" startIcon={<DashboardIcon />}>
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/salary" startIcon={<TrendingUp />}>
                Salary
              </Button>
              <Button color="inherit" component={Link} to="/analysis" startIcon={<BarChartIcon />}>
                Analysis
              </Button>
              <Button color="inherit" component={Link} to="/config" startIcon={<SettingsIcon />}>
                Config
              </Button>
              <IconButton color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
                <LogoutIcon />
              </IconButton>
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

              // Don't show "Dashboard" twice
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
