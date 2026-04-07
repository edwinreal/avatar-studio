import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { api, setAuthToken, type AuthResponse, type UserRecord } from "../lib/api";

type AuthContextValue = {
  user: UserRecord | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (input: { email: string; password: string }) => Promise<void>;
  register: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "synapse-auth";

type StoredSession = {
  token: string;
  user: UserRecord;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const session = JSON.parse(raw) as StoredSession;
      setToken(session.token);
      setUser(session.user);
      setAuthToken(session.token);
    } catch (_error) {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const persist = (session: AuthResponse) => {
    setToken(session.token);
    setUser(session.user);
    setAuthToken(session.token);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login: async (input) => {
        const session = await api.login(input);
        persist(session);
      },
      register: async (input) => {
        const session = await api.register(input);
        persist(session);
      },
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
