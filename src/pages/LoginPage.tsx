import { Google as GoogleIcon } from '@mui/icons-material';
import { Box, Button, Container, Divider, Paper, TextField, Typography } from '@mui/material';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { auth, googleProvider } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import BalancrLogo from '../components/BalancrLogo';
import { AlertSnackbar } from '../components/shared/AlertSnackbar';

const getAuthErrorMessage = (error: unknown, t: (key: string) => string): string => {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    'auth/popup-blocked': t('auth.popupBlocked'),
    'auth/popup-closed-by-user': t('auth.popupClosedByUser'),
    'auth/cancelled-popup-request': t('auth.cancelledPopupRequest'),
    'auth/wrong-password': t('auth.wrongPassword'),
    'auth/user-not-found': t('auth.userNotFound'),
    'auth/invalid-credential': t('auth.invalidCredential'),
    'auth/invalid-email': t('auth.invalidEmail'),
    'auth/email-already-in-use': t('auth.emailAlreadyInUse'),
    'auth/weak-password': t('auth.weakPassword'),
    'auth/network-request-failed': t('auth.networkRequestFailed'),
    'auth/too-many-requests': t('auth.tooManyRequests'),
    'auth/user-disabled': t('auth.userDisabled'),
    'auth/operation-not-allowed': t('auth.operationNotAllowed'),
  };
  return code ? (messages[code] ?? t('auth.genericError')) : t('auth.genericError');
};

const LoginPage: React.FC = () => {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Stato per cambiare modalità
  const [alertState, setAlertState] = useState<{ open: boolean; message: string; severity: 'error' | 'warning' | 'info' | 'success' }>({ open: false, message: '', severity: 'error' });

  const showAlert = (message: string, severity: 'error' | 'warning' | 'info' | 'success' = 'error') => {
    setAlertState({ open: true, message, severity });
  };

  const handleCloseAlert = () => {
    setAlertState(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        // REGISTRAZIONE
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        // LOGIN
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      showAlert(getAuthErrorMessage(error, t));
    }
  };

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      showAlert(getAuthErrorMessage(error, t));
    }
  };

  return (
    <Box sx={{

      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
      <Container maxWidth="xs">
        <Paper elevation={24} sx={{ p: 4, textAlign: 'center', borderRadius: 1, background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
<AlertSnackbar
          open={alertState.open}
          message={alertState.message}
          severity={alertState.severity}
          onClose={handleCloseAlert}
        />

        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <BalancrLogo size={64} showText />
        </Box>
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

          <Divider sx={{ my: 4, color: 'white' }}>OR</Divider>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ input: { color: 'white' } }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ input: { color: 'white' } }}
            />
            <Button fullWidth type="submit" variant="contained" sx={{ mt: 2 }}>
              {isRegistering ? 'Registrati' : 'Accedi'}
            </Button>

            <Typography
              variant="body2"
              sx={{ mt: 2, cursor: 'pointer', color: 'primary.main', textAlign: 'center' }}
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering
                ? 'Hai già un account? Accedi'
                : 'Non hai un account? Registrati qui'}
            </Typography>
          </form>
        </Paper>

      </Container>


    </Box>
  );
};

export default LoginPage;
