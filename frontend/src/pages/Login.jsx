import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await login(email, password);
    setBusy(false);
    if (r.ok) navigate("/dashboard");
    else setErr(r.error || "Login failed");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#f8fafc] px-4">
      <div className="tm-card w-full max-w-md p-8">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#1e3a8a] text-white grid place-items-center font-heading font-bold mb-4">T</div>
          <h1 className="font-heading text-2xl">Welcome back</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to continue your tax learning journey.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="tm-label">Email</label>
            <input
              data-testid="login-email"
              className="tm-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="tm-label">Password</label>
            <input
              data-testid="login-password"
              className="tm-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {err && <div className="tm-feedback-error text-sm" data-testid="login-error">{err}</div>}
          <button
            type="submit"
            data-testid="login-submit"
            disabled={busy}
            className="tm-btn-primary w-full py-2.5"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 mt-6">
          New here?{" "}
          <Link to="/register" data-testid="go-register" className="text-[#2563eb] font-semibold hover:underline">
            Create an account
          </Link>
        </div>
        <div className="text-center text-xs text-slate-400 mt-2">
          <Link to="/" className="hover:text-slate-600">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
