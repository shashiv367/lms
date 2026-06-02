import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/shared-types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<boolean>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const { data } = await authService.login({ email, password });
        if (data.success) {
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            isAuthenticated: true,
          });
        }
      },

      register: async (name, email, password) => {
        const { data } = await authService.register({ name, email, password });
        if (data.success) {
          set({
            user: data.data.user,
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken,
            isAuthenticated: true,
          });
        }
      },

      logout: () => {
        authService.logout().catch(() => {});
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshSession: async () => {
        const rt = get().refreshToken;
        if (!rt) return false;
        try {
          const { data } = await authService.refresh(rt);
          if (data.success) {
            set({
              accessToken: data.data.accessToken,
              refreshToken: data.data.refreshToken,
            });
            return true;
          }
        } catch {
          get().logout();
        }
        return false;
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'meetings-auth',
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
