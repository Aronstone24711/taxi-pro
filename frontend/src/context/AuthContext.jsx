import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { api, formatApiError, setToken, getToken, devWarn } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=checking, false=logged out, obj=logged in
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const hasToken = !!getToken();
    if (!hasToken && typeof document !== "undefined" && !document.cookie) {
      setUser(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me", { validateStatus: (s) => s < 500 });
      if (data && data.email) {
        setUser(data);
      } else {
        setToken(null);
        setUser(false);
      }
    } catch (err) {
      // Network/timeout — clear stale token and drop to logged-out state.
      devWarn("[taxquest] /auth/me failed:", err?.message || err);
      setToken(null);
      setUser(false);
    }
  }, []); // deps are all module-level or stable setters — intentionally empty

  useEffect(() => { refresh(); }, [refresh]);

  const login = useCallback(async (email, password) => {
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.access_token) setToken(data.access_token);
      setUser(data);
      return { ok: true };
    } catch (e) {
      const msg = formatApiError(e);
      devWarn("[taxquest] login failed:", msg);
      setError(msg);
      return { ok: false, error: msg };
    }
  }, []);

  const register = useCallback(async (email, password, name, extras = {}) => {
    setError("");
    try {
      const { data } = await api.post("/auth/register", { email, password, name, ...extras });
      if (data.access_token) setToken(data.access_token);
      setUser(data);
      return { ok: true };
    } catch (e) {
      const msg = formatApiError(e);
      devWarn("[taxquest] register failed:", msg);
      setError(msg);
      return { ok: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      devWarn("[taxquest] logout API failed (ignored):", err?.message || err);
    }
    setToken(null);
    setUser(false);
  }, []);

  // Memoize context value to prevent unnecessary re-renders in consumers.
  const value = useMemo(
    () => ({ user, error, login, register, logout, refreshUser: refresh, setUser }),
    [user, error, login, register, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
