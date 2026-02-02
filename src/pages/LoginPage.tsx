import { Google as GoogleIcon } from '@mui/icons-material';
import { Box, Button, Container, Divider, Paper, TextField, Typography } from '@mui/material';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { auth, googleProvider } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { getEnvVar } from '../utils/variables.utils';

const LoginPage: React.FC = () => {
  const { user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // Stato per cambiare modalità

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        // REGISTRAZIONE
        await createUserWithEmailAndPassword(auth, email, password);
        // console.log("Account creato con successo!");
      } else {
        // LOGIN
        await signInWithEmailAndPassword(auth, email, password);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Errore:", error.code);
      // Esempio: alert("Errore: " + error.message);
    }
  };

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
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
    }}>
      <Container maxWidth="xs">
        <Paper elevation={24} sx={{ p: 4, textAlign: 'center', borderRadius: 1, background: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
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
              sx={{ mt: 2, cursor: 'pointer', color: '#6366f1', textAlign: 'center' }}
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
