import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthInitialized: false,
  role: null, // 'guide', 'patient', 'admin'

  setUser: (user, role) => set({
    user,
    isAuthenticated: !!user,
    isAuthInitialized: true,
    role
  }),

  logout: () => set({
    user: null,
    isAuthenticated: false,
    role: null
  }),

  setAuthInitialized: () => set({ isAuthInitialized: true })
}));
