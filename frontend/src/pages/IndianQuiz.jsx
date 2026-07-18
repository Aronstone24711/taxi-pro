import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Confetti from "@/components/Confetti";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { RotateCcw, Flame, Target, Zap } from "lucide-react";

const streakMessages = {
  3: { icon: "🔥", text: "3 in a row!" },
  5: { icon: "⚡", text: "5-streak — you're rolling!" },
  7: { icon: "🚀", text: "7-streak! Absolute pro." },
  10: { icon: "🏆", text: "10-STREAK LEGEND!" },
  15: { icon: "👑", text: "15!! Bow down." },
};

const cheers = ["Nice one!", "Boom.", "Correct!", "Sharp!", "You got it.", "Yep!", "Spot on."];
const oopsies = ["Not quite.", "So close!", "Nope.", "Try again.", "Almost!", "Oof."];

export default function IndianQuiz() {
  const [pool, setPool] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState(null);
  const [confettiKey, setConfettiKey] = useState(0);
  const [flash, setFlash] = useState(null); // { icon, text }
  const { setUser } = useAuth();

  useEffect(() => {
    api.get("/quiz/indian")
      .then(({ data }) => setPool(shuffle(data.quiz)))
      .catch((err) => console.warn("[taxquest] load Indian quiz failed:", err?.message || err));
  }, []);

  const q = pool[idx];

  const submitProgress = async (isCorrect, newStreak) => {
    try {
      const { data } = await api.post("/quiz/submit", {
        quiz_type: "indian",
        score: isCorrect ? 1 : 0,
        total: 1,
        streak: newStreak,
      });
      setUser(data);
    } catch (err) {
      console.warn("[taxquest] submit progress failed:", err?.message || err);
    }
  };

  const pick = async (i) => {
    if (answered) return;
    setAnswered(true);
    setPicked(i);
    const correct = i === q.correct;
    let newScore = score, newStreak = streak, newBest = best;
    if (correct) {
      newScore = score + 1;
      newStreak = streak + 1;
      if (newStreak > best) newBest = newStreak;
      if (streakMessages[newStreak]) {
        setFlash(streakMessages[newStreak]);
        setConfettiKey((k) => k + 1);
      }
    } else {
      newStreak = 0;
    }
    setScore(newScore); setStreak(newStreak); setBest(newBest);
    await submitProgress(correct, newStreak);
  };

  const next = () => {
    let nextIdx = idx + 1;
    let newPool = pool;
    if (nextIdx >= pool.length) { newPool = shuffle(pool); nextIdx = 0; setPool(newPool); }
    setIdx(nextIdx); setAnswered(false); setPicked(null); setFlash(null);
  };

  const reset = () => {
    setIdx(0); setScore(0); setStreak(0); setAnswered(false); setPicked(null); setFlash(null);
    setPool(shuffle([...pool]));
  };

  const isCorrect = answered && picked === q?.correct;
  const cheer = isCorrect ? cheers[picked % cheers.length] : oopsies[picked % oopsies.length];

  return (
    <Layout title="Indian Tax Quiz 🇮🇳" subtitle="Fast questions on income tax, GST & deductions — no pressure, just points.">
      <Confetti fire={confettiKey} />

      <div className="grid lg:grid-cols-[1fr_280px] gap-6">
        <section className="tm-card p-6 lg:p-8 relative">
          {flash && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-amber-200 shadow-sm px-3 py-1.5 rounded-full text-sm font-semibold text-amber-700 animate-fade-in">
              <span className="mr-1">{flash.icon}</span>{flash.text}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mb-5">
            <span className="tm-badge" data-testid="quiz-qnum">Q {idx + 1}</span>
            <span className="tm-badge" data-testid="quiz-score"><Target size={11} className="mr-0.5" /><span className="font-mono">{score}</span></span>
            <span className="tm-badge" data-testid="quiz-streak"><Flame size={11} className="mr-0.5" /><span className="font-mono">{streak}</span> streak</span>
            <button data-testid="quiz-reset" onClick={reset} className="ml-auto tm-btn-outline text-xs inline-flex items-center gap-1.5"><RotateCcw size={12} /> Reset</button>
          </div>

          {!q ? (
            <div className="py-8 text-center text-slate-500 text-sm">Loading questions…</div>
          ) : (
            <>
              <h2 className="font-heading text-xl sm:text-[22px] leading-snug mb-5">{q.q}</h2>
              <div className="grid gap-3">
                {q.opts.map((opt, i) => {
                  let cls = "tm-option";
                  if (answered) {
                    if (i === q.correct) cls += " correct";
                    else if (i === picked) cls += " incorrect";
                  }
                  return (
                    <button key={`${q.q}-${i}`} data-testid={`quiz-opt-${i}`} disabled={answered} onClick={() => pick(i)} className={cls}>
                      <span className="font-mono text-slate-400 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                    </button>
                  );
                })}
              </div>

              {answered && (
                <div className={`mt-5 ${isCorrect ? "tm-feedback-success" : "tm-feedback-error"}`} data-testid="quiz-feedback">
                  <div className="text-sm font-semibold mb-0.5">
                    {isCorrect ? `✓ ${cheer}` : `✗ ${cheer} Answer: ${q.opts[q.correct]}`}
                  </div>
                  <div className="text-sm opacity-90">{q.exp}</div>
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <button data-testid="quiz-next" onClick={next} disabled={!answered} className="tm-btn-primary">
                  Next question →
                </button>
                {streak >= 3 && (
                  <span className="text-xs text-amber-700 inline-flex items-center gap-1"><Zap size={12} /> Keep the streak alive!</span>
                )}
              </div>
            </>
          )}
        </section>

        <aside className="tm-card p-6 h-fit">
          <h3 className="font-heading text-base mb-3">Session stats</h3>
          <MiniRow label="Correct" value={score} />
          <MiniRow label="Best streak" value={best} />
          <MiniRow label="Total answered" value={idx + (answered ? 1 : 0)} />
          <div className="text-xs text-slate-500 mt-4">
            +10 points per correct answer. Streaks unlock <span className="font-semibold">achievements</span>. Have fun.
          </div>
        </aside>
      </div>
    </Layout>
  );
}

function MiniRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="font-mono font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
