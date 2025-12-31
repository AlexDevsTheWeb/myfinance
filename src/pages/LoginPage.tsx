import { Google as GoogleIcon } from '@mui/icons-material';
import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { signInWithPopup } from 'firebase/auth';
import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth, googleProvider } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { getEnvVar } from '../utils/variables.utils';

const LoginPage: React.FC = () => {
  const { user } = useAuthStore();

  const appTitle = getEnvVar('VITE_REACT_APP_TITLE');
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <Box sx={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
      <Container maxWidth="xs">
        <Paper elevation={24} sx={{ p: 4, textAlign: 'center', borderRadius: 4, background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: '#6366f1' }}>
            {appTitle}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
            Track your finances with ease and precision.
          </Typography>
          <Button
            fullWidth
            variant="contained"
            size="large"
            startIcon={<GoogleIcon />}
            onClick={handleLogin}
            sx={{ py: 1.5, fontSize: '1.1rem' }}
          >
            Sign in with Google
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
