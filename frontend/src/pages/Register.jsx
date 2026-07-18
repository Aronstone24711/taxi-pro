import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, Rocket, GraduationCap } from "lucide-react";

const experienceOptions = [
  { id: "beginner", label: "Just starting", icon: Sparkles, blurb: "New to taxes — teach me the basics", accent: "text-emerald-600 border-emerald-200 bg-emerald-50/60" },
  { id: "intermediate", label: "Getting there", icon: GraduationCap, blurb: "I file my own returns, want to save more", accent: "text-blue-600 border-blue-200 bg-blue-50/60" },
  { id: "pro", label: "Tax nerd", icon: Rocket, blurb: "Freelancer / CA / finance pro — challenge me", accent: "text-purple-600 border-purple-200 bg-purple-50/60" },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState("");
  const [experience, setExperience] = useState("beginner");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const r = await register(email, password, name, {
      age: age ? Number(age) : null,
      experience,
    });
    setBusy(false);
    if (r.ok) navigate("/dashboard");
    else setErr(r.error || "Registration failed");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-[#f8fafc] px-4 py-10">
      <div className="tm-card w-full max-w-lg p-8">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-lg bg-[#1e3a8a] text-white grid place-items-center font-heading font-bold mb-4">T</div>
          <h1 className="font-heading text-2xl">Let's get you started 🎉</h1>
          <p className="text-sm text-slate-500 mt-1">Free forever. Takes 30 seconds — no card, no spam.</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="tm-label">Full name</label>
              <input data-testid="register-name" className="tm-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="tm-label">Age</label>
              <input data-testid="register-age" type="number" min="10" max="120" className="tm-input font-mono"
                value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 22" />
            </div>
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

          <div>
            <label className="tm-label">How would you describe yourself?</label>
            <div className="grid gap-2 mt-1">
              {experienceOptions.map(({ id, label, icon: Icon, blurb, accent }) => (
                <button
                  key={id}
                  type="button"
                  data-testid={`register-exp-${id}`}
                  onClick={() => setExperience(id)}
                  className={`text-left rounded-lg border p-3 flex items-start gap-3 transition ${experience === id ? accent + " border-current" : "border-slate-200 hover:border-slate-300 bg-white"}`}
                >
                  <Icon size={18} className={experience === id ? "" : "text-slate-400"} />
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold ${experience === id ? "" : "text-slate-800"}`}>{label}</div>
                    <div className="text-[12.5px] text-slate-500">{blurb}</div>
                  </div>
                  <div className="ml-auto">
                    <span className={`inline-block w-4 h-4 rounded-full border ${experience === id ? "border-current bg-current" : "border-slate-300"}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {err && <div className="tm-feedback-error text-sm" data-testid="register-error">{err}</div>}

          <button type="submit" data-testid="register-submit" disabled={busy} className="tm-btn-primary w-full py-2.5">
            {busy ? "Creating account…" : "Let's go →"}
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
