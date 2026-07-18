import { useEffect, useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Search, ArrowLeft, Play, RotateCcw, CheckCircle2 } from "lucide-react";

export default function WorldExplorer() {
  const [countries, setCountries] = useState([]);
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => { api.get("/countries").then(({ data }) => setCountries(data.countries || [])); }, []);

  const regions = useMemo(() => Array.from(new Set(countries.map(c => c.region).filter(Boolean))).sort(), [countries]);
  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return countries.filter(c =>
      (!region || c.region === region) &&
      (!s || c.key.toLowerCase().includes(s) || (c.region || "").toLowerCase().includes(s))
    );
  }, [countries, search, region]);

  if (selected) return <CountryView country={selected} onBack={() => setSelected(null)} />;

  return (
    <Layout title="World Tax Explorer" subtitle={`${countries.length} countries — search, compare, quiz yourself.`}>
      <div className="tm-card p-5 sm:p-6 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              data-testid="explorer-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries or regions…"
              className="tm-input pl-9"
            />
          </div>
          <select
            data-testid="explorer-region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="tm-input sm:max-w-[200px]"
          >
            <option value="">All regions</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(c => (
          <button
            key={c.key}
            data-testid={`country-card-${c.region}`}
            onClick={() => setSelected(c)}
            className="tm-card p-4 text-left hover:border-blue-400 hover:-translate-y-0.5 hover:shadow-sm transition"
          >
            <div className="text-3xl leading-none mb-2">{c.key.split(" ")[0]}</div>
            <div className="font-heading text-[15px] leading-tight">{c.key.split(" ").slice(1).join(" ")}</div>
            <div className="text-[11px] uppercase tracking-widest text-slate-400 mt-1">{c.region || "—"}</div>
            <div className="mt-3 flex items-center justify-between text-[12px]">
              <span className="text-slate-500">Personal</span>
              <span className="font-mono text-slate-800">{c.info?.personal || "—"}</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-500">Corporate</span>
              <span className="font-mono text-slate-800">{c.info?.corp || "—"}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-slate-500 text-sm py-10">No countries match your search.</div>
        )}
      </div>
    </Layout>
  );
}

function CountryView({ country, onBack }) {
  const [phase, setPhase] = useState("intro"); // intro | active | complete
  const [pool, setPool] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [picked, setPicked] = useState(null);
  const { setUser } = useAuth();

  useEffect(() => { setPool(shuffle(country.quiz || [])); }, [country]);

  const q = pool[idx];

  const pick = (i) => {
    if (answered) return;
    setAnswered(true); setPicked(i);
    if (i === q.correct) setScore(s => s + 1);
  };

  const next = async () => {
    if (idx + 1 >= pool.length) {
      // finalize
      try {
        const { data } = await api.post("/quiz/submit", {
          quiz_type: "country",
          country_key: country.key,
          score: score + (picked === q.correct ? 0 : 0), // score already includes last if correct
          total: pool.length,
          streak: 0,
        });
        setUser(data);
      } catch {}
      setPhase("complete");
    } else {
      setIdx(i => i + 1); setAnswered(false); setPicked(null);
    }
  };

  const retry = () => {
    setPool(shuffle(country.quiz || []));
    setIdx(0); setScore(0); setAnswered(false); setPicked(null); setPhase("intro");
  };

  return (
    <Layout title={country.key} subtitle={country.region}>
      <button data-testid="country-back" onClick={onBack} className="tm-btn-outline text-sm inline-flex items-center gap-1.5 mb-5">
        <ArrowLeft size={14} /> Back to countries
      </button>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {Object.entries(country.info || {}).map(([k, v]) => (
          <div key={k} className="tm-card p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-1">{k}</div>
            <div className="font-mono text-[15px] font-semibold text-slate-900">{v}</div>
          </div>
        ))}
      </div>

      {country.notes && (
        <div className="tm-card p-5 mb-6">
          <div className="text-[11px] uppercase tracking-widest text-slate-500 mb-1.5">Key notes</div>
          <div className="text-sm text-slate-700 leading-relaxed">{country.notes}</div>
        </div>
      )}

      <section className="tm-card p-6 lg:p-8">
        <h3 className="font-heading text-lg mb-4">Quick quiz</h3>

        {phase === "intro" && (
          <div>
            <p className="text-sm text-slate-500 mb-4">Test your knowledge on {country.key} — {pool.length} questions.</p>
            <button data-testid="country-quiz-start" onClick={() => setPhase("active")} className="tm-btn-primary inline-flex items-center gap-1.5">
              <Play size={14} /> Start quiz
            </button>
          </div>
        )}

        {phase === "active" && q && (
          <>
            <div className="flex items-center gap-2 mb-4">
              <span className="tm-badge" data-testid="cq-num">Q {idx + 1}/{pool.length}</span>
              <span className="tm-badge">Score <span className="font-mono ml-1">{score}</span></span>
            </div>
            <h4 className="font-heading text-lg mb-4">{q.q}</h4>
            <div className="grid gap-3">
              {q.opts.map((opt, i) => {
                let cls = "tm-option";
                if (answered) {
                  if (i === q.correct) cls += " correct";
                  else if (i === picked) cls += " incorrect";
                }
                return (
                  <button key={i} data-testid={`cq-opt-${i}`} disabled={answered} onClick={() => pick(i)} className={cls}>
                    <span className="font-mono text-slate-400 mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className={`mt-4 ${picked === q.correct ? "tm-feedback-success" : "tm-feedback-error"}`}>
                <div className="text-sm font-semibold">{picked === q.correct ? "✓ Correct!" : `✗ Answer: ${q.opts[q.correct]}`}</div>
                <div className="text-sm opacity-90 mt-0.5">{q.exp}</div>
              </div>
            )}
            <div className="mt-5">
              <button data-testid="cq-next" onClick={next} disabled={!answered} className="tm-btn-primary">
                {idx + 1 >= pool.length ? "Finish quiz" : "Next →"}
              </button>
            </div>
          </>
        )}

        {phase === "complete" && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 grid place-items-center mx-auto mb-3 text-emerald-600">
              <CheckCircle2 size={26} />
            </div>
            <div className="font-heading text-xl">Quiz complete!</div>
            <div className="font-mono text-2xl font-semibold mt-2">{score}/{pool.length}</div>
            <div className="text-slate-500 text-sm mt-1">
              {Math.round((score / pool.length) * 100)}% correct — {country.key}
            </div>
            <button data-testid="cq-retry" onClick={retry} className="tm-btn-outline mt-4 inline-flex items-center gap-1.5">
              <RotateCcw size={14} /> Take again
            </button>
          </div>
        )}
      </section>
    </Layout>
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
