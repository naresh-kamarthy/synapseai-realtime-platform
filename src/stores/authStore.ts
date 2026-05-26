import { create } from 'zustand';
import { User } from '../types';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticating: boolean;
  authError: string | null;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setAuthenticating: (isAuth: boolean) => void;
  setAuthError: (error: string | null) => void;
  clearAuthError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticating: true,
  authError: null,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setAuthenticating: (isAuth) => set({ isAuthenticating: isAuth }),
  setAuthError: (error) => set({ authError: error }),
  clearAuthError: () => set({ authError: null })
}));
