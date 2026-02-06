import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { UserPublic, UserRole } from '@jurix/shared-types';
import { authApi } from '@/lib/api';

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  clearError: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authApi.login(email, password);
          const { accessToken, refreshToken, user } = response.data;

          set({
            user,
            accessToken,
            refreshToken,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Erro ao fazer login';
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: async () => {
        const { accessToken } = get();

        try {
          if (accessToken) {
            await authApi.logout(accessToken);
          }
        } catch {
          // Ignora erros no logout
        } finally {
          set(initialState);
        }
      },

      refreshSession: async () => {
        const { refreshToken } = get();

        if (!refreshToken) {
          return false;
        }

        try {
          const response = await authApi.refresh(refreshToken);
          const { accessToken, refreshToken: newRefreshToken, user } = response.data;

          set({
            user,
            accessToken,
            refreshToken: newRefreshToken,
          });

          return true;
        } catch {
          set(initialState);
          return false;
        }
      },

      clearError: () => set({ error: null }),

      hasRole: (roles: UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        return roles.includes(user.role);
      },
    }),
    {
      name: 'jurix-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);

// Helper hook para obter o token
export const useAccessToken = () => useAuthStore((state) => state.accessToken);

