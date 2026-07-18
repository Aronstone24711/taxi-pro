import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { Medal, Trophy, Flame, Users, Globe2, BookOpen, Target } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get("/leaderboard").then(({ data }) => data.leaderboard || []),
      api.get("/stats").then(({ data }) => data).catch(() => null),
    ])
      .then(([lb, s]) => { setRows(lb); setStats(s); })
      .catch((err) => console.warn("[taxquest] leaderboard load failed:", err?.message || err))
      .finally(() => setLoading(false));
  }, []);

  const globalCount = stats?.global_learners ?? 0;
  const indiaChamps = stats?.india_quiz_champs ?? 0;
  const worldExplorers = stats?.world_explorers ?? 0;
  const totalQs = stats?.total_questions ?? 0;

  return (
    <Layout title="Leaderboard 🏆" subtitle="Top learners across TaxQuest — updated live.">
      {/* Community stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatBox label="Global learners" value={globalCount} icon={Users}   accent="text-[#2563eb]"  testId="stat-global"  hint="Sign-ups worldwide" />
        <StatBox label="🇮🇳 India champs" value={indiaChamps}  icon={BookOpen} accent="text-amber-600"  testId="stat-india"   hint="Learners who took the Indian quiz" />
        <StatBox label="🌍 World explorers" value={worldExplorers} icon={Globe2}   accent="text-emerald-600" testId="stat-world"   hint="Learners who took a country quiz" />
        <StatBox label="Questions answered" value={totalQs} icon={Target}   accent="text-purple-600" testId="stat-answered" hint="Combined across all users" />
      </div>

      <div className="tm-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2 flex-wrap">
          <Trophy size={17} className="text-amber-500" />
          <div className="font-heading text-base">Top {Math.max(rows.length, 20)} players</div>
          <div className="ml-auto text-xs text-slate-500">Score = correct answers × 10</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1e3a8a] grid place-items-center mx-auto mb-3">
              <Trophy size={20} />
            </div>
            <div className="font-heading text-base mb-1">No players yet — be the first!</div>
            <div className="text-sm text-slate-500 mb-4">
              Answer at least one question in the Indian Quiz or a country quiz to appear here.
            </div>
            <a href="/quiz" className="tm-btn-primary text-sm inline-flex items-center gap-1.5" data-testid="lb-cta-quiz">
              Take the Indian Quiz →
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto tm-scroll">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Rank</th>
                  <th className="text-left px-6 py-3 font-medium">Player</th>
                  <th className="text-right px-6 py-3 font-medium" title="Correct answers × 10">Points</th>
                  <th className="text-right px-6 py-3 font-medium" title="Longest correct-in-a-row streak">Best streak</th>
                  <th className="text-right px-6 py-3 font-medium" title="Correct out of total questions answered">Correct / Total</th>
                  <th className="text-right px-6 py-3 font-medium" title="Achievements unlocked">Badges</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const isMe = user && user !== false && r.name === user.name;
                  const rankBg =
                    r.rank === 1 ? "bg-amber-50" :
                    r.rank === 2 ? "bg-slate-100/70" :
                    r.rank === 3 ? "bg-orange-50" : "";
                  return (
                    <tr
                      key={`${r.name}-${r.rank}`}
                      data-testid={`lb-row-${r.rank}`}
                      className={`border-t border-slate-100 hover:bg-slate-50/70 ${rankBg} ${isMe ? "bg-blue-50/40" : ""}`}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          {r.rank <= 3 ? <Medal size={14} className={r.rank === 1 ? "text-amber-500" : r.rank === 2 ? "text-slate-400" : "text-orange-500"} /> : <span className="w-3.5" />}
                          <span className="font-mono font-semibold text-slate-800">#{r.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 font-medium">
                        {r.name}{isMe && <span className="ml-2 tm-badge">You</span>}
                      </td>
                      <td className="px-6 py-3 text-right font-mono font-semibold">{r.total_score.toLocaleString()}</td>
                      <td className="px-6 py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-mono"><Flame size={12} className="text-amber-500" />{r.best_streak}</span>
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-slate-600">
                        {r.correct_answers.toLocaleString()} <span className="text-slate-400">/ {r.questions_answered.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-3 text-right font-mono">{r.achievements}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

function StatBox({ label, value, icon: Icon, accent, testId, hint }) {
  return (
    <div className="tm-card p-5" data-testid={testId} title={hint}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg bg-slate-100 grid place-items-center ${accent}`}>
          <Icon size={17} />
        </div>
      </div>
      <div className="font-mono text-2xl font-semibold text-slate-900">{Number(value).toLocaleString()}</div>
      <div className="text-[11px] uppercase tracking-widest text-slate-500 mt-1">{label}</div>
    </div>
  );
}
