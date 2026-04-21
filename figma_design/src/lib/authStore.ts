import { create } from 'zustand';

const TOKEN_KEY = 'simplechef_token';

interface AuthState {
  token: string | null;
  isHydrated: boolean;
  setToken: (token: string | null) => Promise<void>;
  loadToken: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isHydrated: false,

  setToken: async (token) => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
    set({ token });
  },

  loadToken: async () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      set({ token, isHydrated: true });
    } catch {
      set({ isHydrated: true });
    }
  },

  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null });
  },
}));
