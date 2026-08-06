import { create } from 'zustand';

export const useAppStore = create((set) => ({
  isGlobalLoading: false,
  loadingMessage: '',
  
  toasts: [],

  setGlobalLoading: (isLoading, message = '') => set({
    isGlobalLoading: isLoading,
    loadingMessage: message
  }),

  addToast: (toast) => set((state) => ({
    toasts: [...state.toasts, { id: Date.now(), ...toast }]
  })),

  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  }))
}));
