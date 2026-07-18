import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Flame, Target, Trophy, BookOpen, Award, ArrowRight, Sparkles
} from "lucide-react";

const greetings = ["👋 Hey", "🎯 Hi", "🚀 Welcome back", "☕ Morning", "✨ Yo"];
const tipsByExperience = {
  beginner: {
    label: "Beginner mode",
    emoji: "🌱",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    tip: "Start with the Indian Quiz — 15 easy warm-ups. Every correct answer earns 10 points.",
    cta: { to: "/quiz", label: "Start easy quiz" },
  },
  intermediate: {
    label: "Getting there",
    emoji: "📈",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    tip: "Try the Save Smart calculator — plug in your income and see how much you could save this year.",
    cta: { to: "/save-smart", label: "Open Save Smart" },
  },
  pro: {
    label: "Tax pro mode",
    emoji: "🧠",
    color: "bg-purple-50 text-purple-700 border-purple-200",
    tip: "Race through the World Explorer — 48 countries, per-country quizzes. See how many flags you can master.",
    cta: { to: "/explorer", label: "Open World Explorer" },
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [greeting] = useState(() => greetings[Math.floor(Math.random() * greetings.length)]);

  useEffect(() => {
    api.get("/user/history").then(({ data }) => setHistory(data.history || [])).catch(() => {});
    api.get("/achievements/list").then(({ data }) => setAchievements(data.achievements || [])).catch(() => {});
  }, []);

  const accuracy = user?.questions_answered
    ? Math.round((user.correct_answers / user.questions_answered) * 100)
    : 0;
  const unlocked = new Set(user?.achievements || []);
  const persona = tipsByExperience[user?.experience || "beginner"] || tipsByExperience.beginner;

  return (
    <Layout
      title={`${greeting}, ${user?.name?.split(" ")[0] || "friend"}`}
      subtitle="Your tax learning at a glance — pick anything below to jump back in."
    >
      {/* Persona banner */}
      <div className={`mb-6 rounded-xl border p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 ${persona.color}`} data-testid="persona-banner">
        <div className="text-2xl leading-none">{persona.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold uppercase tracking-widest opacity-70">{persona.label}</div>
          <div className="text-sm mt-0.5">{persona.tip}</div>
        </div>
        <button
          data-testid="persona-cta"
          onClick={() => navigate(persona.cta.to)}
          className="tm-btn-primary text-sm inline-flex items-center gap-1.5 shrink-0"
        >
          <Sparkles size={13} /> {persona.cta.label}
        </button>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Score" value={user?.total_score ?? 0} icon={Target} accent="text-[#2563eb]" testId="stat-score" />
        <StatCard label="Best Streak" value={user?.best_streak ?? 0} icon={Flame} accent="text-amber-600" testId="stat-streak" />
        <StatCard label="Questions" value={user?.questions_answered ?? 0} icon={BookOpen} accent="text-emerald-600" testId="stat-qs" />
        <StatCard label="Accuracy" value={`${accuracy}%`} icon={Trophy} accent="text-purple-600" testId="stat-acc" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <div className="lg:col-span-2 space-y-6">
          <section className="tm-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg">Jump back in</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <QuickAction title="Continue Indian Quiz" desc="Test yourself with GST, ITR, deductions." to="/quiz" testId="qa-quiz" onClick={() => navigate("/quiz")} />
              <QuickAction title="Explore Countries" desc="48+ countries, per-country quizzes." to="/explorer" testId="qa-explorer" onClick={() => navigate("/explorer")} />
              <QuickAction title="Save Smart" desc="Strategies + calculators to lower tax." to="/save-smart" testId="qa-save" onClick={() => navigate("/save-smart")} />
              <QuickAction title="Leaderboard" desc="See where you rank globally." to="/leaderboard" testId="qa-leaderboard" onClick={() => navigate("/leaderboard")} />
            </div>
          </section>

          <section className="tm-card p-6">
            <h2 className="font-heading text-lg mb-4">Recent activity</h2>
            {history.length === 0 ? (
              <div className="text-sm text-slate-500 py-6 text-center">No quiz attempts yet. Start with the Indian Quiz →</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history.slice(0, 8).map((h, i) => (
                  <div key={i} className="py-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{h.quiz_type === "country" ? h.country_key : "Indian Quiz"}</div>
                      <div className="text-slate-400 text-xs">{new Date(h.timestamp).toLocaleString()}</div>
                    </div>
                    <div className="font-mono text-sm">
                      <span className="text-slate-900">{h.score}</span>
                      <span className="text-slate-400">/{h.total}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Achievements */}
        <aside className="tm-card p-6">
          <h2 className="font-heading text-lg mb-4">Achievements</h2>
          <div className="space-y-2.5">
            {achievements.map((a) => {
              const ok = unlocked.has(a.id);
              return (
                <div
                  key={a.id}
                  data-testid={`ach-${a.id}`}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${ok ? "border-emerald-200 bg-emerald-50/50" : "border-slate-200 bg-slate-50/40"}`}
                >
                  <Award size={18} className={ok ? "text-emerald-600" : "text-slate-400"} />
                  <div className="min-w-0">
                    <div className={`text-sm font-semibold ${ok ? "text-emerald-800" : "text-slate-600"}`}>
                      {a.name}
                    </div>
                    <div className="text-xs text-slate-500">{a.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>
    </Layout>
  );
}

function StatCard({ label, value, icon: Icon, accent, testId }) {
  return (
    <div className="tm-card p-5" data-testid={testId}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg bg-slate-100 grid place-items-center ${accent}`}>
          <Icon size={17} />
        </div>
      </div>
      <div className="font-mono text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function QuickAction({ title, desc, testId, onClick }) {
  return (
    <button data-testid={testId} onClick={onClick}
      className="text-left p-4 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition group">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[14px] font-semibold text-slate-900">{title}</div>
          <div className="text-[12.5px] text-slate-500 mt-0.5">{desc}</div>
        </div>
        <ArrowRight size={16} className="text-slate-400 group-hover:text-[#2563eb] mt-0.5" />
      </div>
    </button>
  );
}
