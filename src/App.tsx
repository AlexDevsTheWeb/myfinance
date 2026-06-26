import { Box, CircularProgress } from '@mui/material';
import { onAuthStateChanged, type User } from 'firebase/auth';
import React, { Suspense, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'; // This line is already correct.
import Layout from './components/layout/Layout';
import { TransactionError } from './components/TransactionError';
import { useSyncFinance } from './hooks/useSyncFinance';
import { auth } from './lib/firebase';
import AnalysisPage from './pages/AnalysisPage';
import CarPage from './pages/CarPage';
import ConfigPage from './pages/ConfigPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import SalaryPage from './pages/SalaryPage';
import TransactionsPage from './pages/TransactionsPage';
import UtilitiesPage from './pages/UtilitiesPage';
import InsightsPage from './pages/InsightsPage';
import InvestmentPage from './pages/InvestmentPage';
const ProjectionsPage = React.lazy(() => import('./pages/ProjectionsPage'));
import { useInvestmentSync } from './hooks/useInvestmentSync';
import { useAuthStore } from './store/useAuthStore';
import { useFinanceStore } from './store/useFinanceStore';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isLoggingOut } = useAuthStore();

  if (loading || isLoggingOut) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f172a' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  const { setUser, setLoading } = useAuthStore();
  const { _migrateToMultiAccount } = useFinanceStore();
  useSyncFinance();
  useInvestmentSync();

  useEffect(() => {
    _migrateToMultiAccount();
  }, [_migrateToMultiAccount]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/config" element={
          <ProtectedRoute>
            <ConfigPage />
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <TransactionsPage />
          </ProtectedRoute>
        } />
        <Route path="/salary" element={
          <ProtectedRoute>
            <SalaryPage />
          </ProtectedRoute>
        } />
        <Route path="/analysis" element={
          <ProtectedRoute>
            <AnalysisPage />
          </ProtectedRoute>
        } />
        <Route path="/car" element={
          <ProtectedRoute>
            <CarPage />
          </ProtectedRoute>
        } />
        <Route path="/utilities" element={
          <ProtectedRoute>
            <UtilitiesPage />
          </ProtectedRoute>
        } />
        <Route path="/insights" element={
          <ProtectedRoute>
            <InsightsPage />
          </ProtectedRoute>
        } />
        <Route path="/invest" element={
          <ProtectedRoute>
            <InvestmentPage />
          </ProtectedRoute>
        } />
        <Route path="/projections" element={
          <ProtectedRoute>
            <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
              <ProjectionsPage />
            </Suspense>
          </ProtectedRoute>
        } />
      </Routes>
      <TransactionError />
    </BrowserRouter>
  );
}

export default App;
