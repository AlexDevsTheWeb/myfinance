import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';

export const useLogout = () => {
  const navigate = useNavigate();
  const { setIsLoggingOut } = useAuthStore();

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut(auth);
      // Clear Zustand's persisted state
      localStorage.removeItem('finance-storage');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return logout;
};
