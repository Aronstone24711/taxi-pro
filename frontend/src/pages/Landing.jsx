import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import WeatherBackground from "@/components/WeatherBackground";
import Chatbot from "@/components/Chatbot";
import {
  CheckCircle2, Globe2, PiggyBank, Trophy, BookOpen, Sparkles, ArrowRight
} from "lucide-react";

const bullets = [
  { to: "/quiz",        icon: BookOpen,  title: "Continuous Indian Quiz", text: "GST, income tax slabs, deductions & TDS in an endless stream.",  testId: "bullet-quiz" },
  { to: "/explorer",    icon: Globe2,    title: "48+ Countries Explorer", text: "Compare tax systems across the world with country-specific quizzes.", testId: "bullet-explorer" },
  { to: "/save-smart",  icon: PiggyBank, title: "Save Smart Toolkit",     text: "Calculators, strategies and country tips to legally lower your tax.", testId: "bullet-savesmart" },
  { to: "/leaderboard", icon: Trophy,    title: "Streaks & Leaderboard",  text: "Earn achievements and climb the global leaderboard — free.",         testId: "bullet-leaderboard" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user && user !== false) navigate("/dashboard", { replace: true });
  }, [user, navigate]);

  return (
    <div className="min-h-screen relative">
      <WeatherBackground />
      <Chatbot />

      {/* Header */}
      <header className="border-b border-white/50 bg-white/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 hover:opacity-80 transition"
            data-testid="landing-brand"
          >
            <div className="w-9 h-9 rounded-lg bg-[#1e3a8a] text-white grid place-items-center font-heading font-bold">T</div>
            <div className="text-left">
              <div className="font-heading font-bold text-[15px] leading-none">TaxQuest</div>
              <div className="text-[11px] text-slate-500 mt-0.5 tracking-wider uppercase">LEARN · PLAY · WIN</div>
            </div>
          </button>
          <div className="ml-auto flex items-center gap-2">
            <button data-testid="landing-guest-btn" onClick={() => navigate("/quiz")} className="tm-btn-outline text-sm hidden sm:inline-flex">Try as guest</button>
            <button data-testid="landing-signin-btn" onClick={() => navigate("/login")} className="tm-btn-outline text-sm">Sign in</button>
            <button data-testid="landing-signup-btn" onClick={() => navigate("/register")} className="tm-btn-primary text-sm">Get started</button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-14 grid lg:grid-cols-[1.15fr_1fr] gap-14 items-center">
        <div>
          <span className="tm-badge mb-5" data-testid="hero-badge"><Sparkles size={12} /> Learn taxes, faster</span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] tracking-tight text-slate-900">
            Master taxes in India<br />and around the world.
          </h1>
          <p className="mt-5 text-slate-700 text-[17px] leading-relaxed max-w-xl">
            Interactive quizzes, real tax data from 48+ countries, an AI tax assistant, and practical strategies to legally save more — all in one clean dashboard.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button data-testid="hero-cta-guest" onClick={() => navigate("/quiz")}
              className="tm-btn-primary inline-flex items-center gap-2 text-[15px] px-5 py-3">
              Try it as guest <ArrowRight size={16} />
            </button>
            <button data-testid="hero-cta-secondary" onClick={() => navigate("/register")}
              className="tm-btn-outline text-[15px] px-5 py-3">
              Sign up to save progress
            </button>
          </div>
          <div className="mt-4 text-[12.5px] text-slate-600 max-w-lg">
            No sign-up needed. An account is optional — it just saves your streak, unlocks achievements and puts you on the leaderboard.
          </div>
          <div className="mt-6 flex flex-wrap gap-5 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" /> AI tax assistant included</span>
            <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-600" /> 48+ countries</span>
          </div>
        </div>

        <div className="tm-card p-6 lg:p-7">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Countries" value="48+" />
            <Stat label="Quiz Qs" value="150+" />
            <Stat label="AI Assist" value="24/7" />
          </div>
          <div className="mt-6 space-y-3">
            {bullets.map(({ to, icon: Icon, title, text, testId }) => (
              <button
                key={to}
                data-testid={testId}
                onClick={() => navigate(to)}
                className="w-full text-left flex gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition group"
              >
                <div className="w-9 h-9 shrink-0 rounded-lg bg-blue-50 text-[#2563eb] grid place-items-center">
                  <Icon size={17} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold text-slate-900 flex items-center gap-1">
                    {title}
                    <ArrowRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition text-[#2563eb]" />
                  </div>
                  <div className="text-[12.5px] text-slate-500 leading-snug">{text}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 text-[11.5px] text-slate-500 text-center">
            👆 Click any card — all four are fully playable, no sign-up.
          </div>
        </div>
      </section>

      <footer className="border-t border-white/50 bg-white/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-slate-600">
          © 2026 TaxQuest • Educational content only, not legal or financial advice.
        </div>
      </footer>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/70 p-4 backdrop-blur">
      <div className="font-mono text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-slate-500 mt-1">{label}</div>
    </div>
  );
}
