import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

// Dev-only warn — silenced in production builds to avoid leaking internals.
export function devWarn(...args) {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
}

// Token storage — sessionStorage instead of localStorage so the token does not
// persist beyond the current tab session, reducing XSS blast radius. HTTP-only
// cookies remain the primary auth channel; this token is only a fallback for
// browsers/contexts that block third-party cookies. XSS remains the only viable
// attack surface — we mitigate with strict input escaping + no innerHTML sinks.
const TOKEN_KEY = "taxquest_token";

export function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (err) {
    devWarn("[taxquest] sessionStorage read failed:", err?.message || err);
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    devWarn("[taxquest] sessionStorage write failed:", err?.message || err);
  }
}

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Attach Bearer token as fallback for browsers that block cookies
// (in-app browsers, Safari ITP, corporate networks, etc.)
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Surface unexpected API failures in dev consoles instead of swallowing silently.
api.interceptors.response.use(
  (r) => r,
  (err) => {
    const status = err?.response?.status;
    if (status && status !== 401 && status !== 404) {
      devWarn("[taxquest] API error", status, err?.config?.url, err?.response?.data);
    }
    return Promise.reject(err);
  }
);

export function formatApiError(err) {
  const d = err?.response?.data?.detail;
  if (d == null) return err?.message || "Something went wrong";
  if (typeof d === "string") return d;
  if (Array.isArray(d)) {
    return d.map((e) => (e?.msg ? e.msg : JSON.stringify(e))).join(" ");
  }
  if (d?.msg) return d.msg;
  return String(d);
}
