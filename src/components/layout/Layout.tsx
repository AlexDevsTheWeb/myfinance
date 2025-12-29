import { Dashboard as DashboardIcon, ExitToApp as LogoutIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { AppBar, Box, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../lib/firebase';
import { useAuthStore } from '../../store/useAuthStore';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <AppBar position="sticky" elevation={0} sx={{ background: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: -0.5, color: '#6366f1' }}>
            MyFinance
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={Link} to="/dashboard" startIcon={<DashboardIcon />}>
                Dashboard
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
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
