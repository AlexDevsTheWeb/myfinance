import type { User } from "firebase/auth";

export interface IAuthState {
  user: User | null;
  loading: boolean;
  isLoggingOut: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setIsLoggingOut: (isLoggingOut: boolean) => void;
}