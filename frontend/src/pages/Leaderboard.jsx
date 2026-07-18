import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { Medal, Trophy, Flame } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Leaderboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get("/leaderboard")
      .then(({ data }) => setRows(data.leaderboard || []))
      .catch((err) => console.warn("[taxquest] load leaderboard failed:", err?.message || err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="Leaderboard" subtitle="Top learners across TaxQuest">
      <div className="tm-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
          <Trophy size={17} className="text-amber-500" />
          <div className="font-heading text-base">Top 20</div>
          <div className="ml-auto text-xs text-slate-500">Score = correct answers × 10</div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-slate-500">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No scores yet. Be the first — start the <a href="/quiz" className="text-[#2563eb] font-semibold">Indian Quiz</a>.
          </div>
        ) : (
          <div className="overflow-x-auto tm-scroll">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Rank</th>
                  <th className="text-left px-6 py-3 font-medium">Player</th>
                  <th className="text-right px-6 py-3 font-medium">Score</th>
                  <th className="text-right px-6 py-3 font-medium">Best Streak</th>
                  <th className="text-right px-6 py-3 font-medium">Answered</th>
                  <th className="text-right px-6 py-3 font-medium">Achievements</th>
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
                      <td className="px-6 py-3 text-right font-mono font-semibold">{r.total_score}</td>
                      <td className="px-6 py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-mono"><Flame size={12} className="text-amber-500" />{r.best_streak}</span>
                      </td>
                      <td className="px-6 py-3 text-right font-mono text-slate-600">{r.correct_answers}/{r.questions_answered}</td>
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
