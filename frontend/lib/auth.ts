// src/lib/auth.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthToken } from "@/lib/api";

type Tokens = { accessToken: string | null; refreshToken: string | null };
type User = { id: string; name?: string | null; email?: string | null } | null;

type State = {
  user: User;
  tokens: Tokens;
  hydrated: boolean;
  setUser: (u: User) => void;
  setTokens: (accessToken: string | null, refreshToken?: string | null) => void;
  logout: () => void;
  setHydrated: (v: boolean) => void;
};

export const useAuthStore = create<State>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: { accessToken: null, refreshToken: null },
      hydrated: false,

      setUser: (user) => set({ user }),

      // Sempre atualiza o header do Axios quando o token mudar
      setTokens: (accessToken, refreshToken = get().tokens.refreshToken) => {
        setAuthToken(accessToken || null);
        set({
          tokens: {
            accessToken: accessToken ?? null,
            refreshToken: refreshToken ?? null,
          },
        });
      },

      logout: () => {
        setAuthToken(null);
        set({
          user: null,
          tokens: { accessToken: null, refreshToken: null },
        });
      },

      setHydrated: (v) => set({ hydrated: v }),
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => AsyncStorage),
      // salva somente o que interessa
      partialize: (s) => ({ user: s.user, tokens: s.tokens }),
      // Ao reidratar, garanta que o Axios receba o token e marque hydrated=true
      onRehydrateStorage: () => (state, error) => {
        const token = state?.tokens?.accessToken ?? null;
        setAuthToken(token);
        state?.setHydrated(true);
        if (error) {
          // opcional: console.warn('[auth] rehydrate error', error);
        }
      },
    },
  ),
);

// Selectors úteis (opcional)
export const selectIsAuthenticated = (s: State) => !!s.tokens.accessToken;
export const selectAccessToken = (s: State) => s.tokens.accessToken;
export const selectUser = (s: State) => s.user;
export const selectHydrated = (s: State) => s.hydrated;
