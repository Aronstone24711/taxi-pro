import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api, formatApiError, setToken, getToken } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null=checking, false=logged out, obj=logged in
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    // Skip the call entirely if we have neither a token nor any cookies for the domain.
    const hasToken = !!getToken();
    if (!hasToken && typeof document !== "undefined" && !document.cookie) {
      setUser(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me", { validateStatus: (s) => s < 500 });
      if (data && data.email) setUser(data);
      else { setToken(null); setUser(false); }
    } catch {
      setToken(null);
      setUser(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email, password) => {
    setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      if (data.access_token) setToken(data.access_token);
      setUser(data);
      return { ok: true };
    } catch (e) {
      const msg = formatApiError(e);
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  const register = async (email, password, name, extras = {}) => {
    setError("");
    try {
      const { data } = await api.post("/auth/register", { email, password, name, ...extras });
      if (data.access_token) setToken(data.access_token);
      setUser(data);
      return { ok: true };
    } catch (e) {
      const msg = formatApiError(e);
      setError(msg);
      return { ok: false, error: msg };
    }
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch {}
    setToken(null);
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, error, login, register, logout, refreshUser: refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
