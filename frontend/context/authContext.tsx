// frontend/context/authContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAuthToken } from "@/lib/api";
import {
  registerForPushNotificationsAsync,
  sendPushTokenToBackend,
  removePushTokenFromBackend,
} from "@/services/notifications";

type User = { id: string; name: string; email: string };

type AuthContextType = {
  user: User | null;
  isLoading: boolean; // carregando/hidratando do AsyncStorage
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;

  // ações
  signIn: (email: string, password: string) => Promise<void>;
  login: (user: User, access: string, refresh: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE = {
  user: "auth:user",
  access: "auth:access",
  refresh: "auth:refresh",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccess] = useState<string | null>(null);
  const [refreshToken, setRefresh] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hidrata do AsyncStorage ao iniciar o app
  useEffect(() => {
    (async () => {
      try {
        const [u, a, r] = await Promise.all([
          AsyncStorage.getItem(STORAGE.user),
          AsyncStorage.getItem(STORAGE.access),
          AsyncStorage.getItem(STORAGE.refresh),
        ]);

        const parsedUser = u ? (JSON.parse(u) as User) : null;
        setUser(parsedUser);
        setAccess(a);
        setRefresh(r);

        // Deixa o Axios com Authorization se já houver token
        setAuthToken(a || null);
      } catch (e) {
        console.log("[Auth] hydrate error", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(
    async (u: User, access: string, refresh: string) => {
      setUser(u);
      setAccess(access);
      setRefresh(refresh);

      await Promise.all([
        AsyncStorage.setItem(STORAGE.user, JSON.stringify(u)),
        AsyncStorage.setItem(STORAGE.access, access),
        AsyncStorage.setItem(STORAGE.refresh, refresh),
      ]);

      setAuthToken(access);

      // Registra push notifications após login
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          await sendPushTokenToBackend(pushToken);
          console.log('✅ Push token registrado:', pushToken);
        }
      } catch (error) {
        console.error('❌ Erro ao registrar push token:', error);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    // Remove push token do backend antes de fazer logout
    try {
      await removePushTokenFromBackend();
      console.log('✅ Push token removido');
    } catch (error) {
      console.error('❌ Erro ao remover push token:', error);
    }

    setUser(null);
    setAccess(null);
    setRefresh(null);
    await Promise.all([
      AsyncStorage.removeItem(STORAGE.user),
      AsyncStorage.removeItem(STORAGE.access),
      AsyncStorage.removeItem(STORAGE.refresh),
    ]);
    setAuthToken(null);
  }, []);

  // Faz login no backend e salva user + tokens
  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await api.post("/auth/login", { email, password });
        // backend retorna { success, data: { user, accessToken, refreshToken } }
        const payload = res.data?.data ?? res.data;
        if (!payload?.user || !payload?.accessToken) {
          throw new Error("Resposta de login inválida");
        }
        await login(
          payload.user,
          payload.accessToken,
          payload.refreshToken ?? "",
        );
      } catch (err) {
        // propaga pra tela tratar (Alert)
        throw err;
      }
    },
    [login],
  );

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isLoggedIn: !!accessToken,
      accessToken,
      refreshToken,
      signIn,
      login,
      logout,
    }),
    [user, isLoading, accessToken, refreshToken, signIn, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
