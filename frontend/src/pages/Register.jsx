import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await register(email, password, name);
    setBusy(false);
    if (r.ok) navigate("/dashboard");
    else setErr(r.error || "Registration failed");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#f8fafc] px-4">
      <div className="tm-card w-full max-w-md p-8">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#1e3a8a] text-white grid place-items-center font-heading font-bold mb-4">T</div>
          <h1 className="font-heading text-2xl">Create your account</h1>
          <p className="text-sm text-slate-500 mt-1">Free forever. No credit card required.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="tm-label">Full name</label>
            <input data-testid="register-name" className="tm-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="tm-label">Email</label>
            <input data-testid="register-email" className="tm-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="tm-label">Password</label>
            <input data-testid="register-password" className="tm-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <div className="text-[11px] text-slate-500 mt-1">Minimum 6 characters.</div>
          </div>
          {err && <div className="tm-feedback-error text-sm" data-testid="register-error">{err}</div>}
          <button type="submit" data-testid="register-submit" disabled={busy} className="tm-btn-primary w-full py-2.5">
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" data-testid="go-login" className="text-[#2563eb] font-semibold hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
