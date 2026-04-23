import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';

export const useLogout = () => {
  const navigate = useNavigate();
  const { setIsLoggingOut } = useAuthStore();

  const logout = async () => {
    setIsLoggingOut(true);
    const userId = useAuthStore.getState().user?.uid;
    try {
      await signOut(auth);
      if (userId) {
        localStorage.removeItem(`finance-storage-${userId}`);
      }
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return logout;
};
