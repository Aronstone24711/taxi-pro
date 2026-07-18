import { useState } from "react";
import Layout from "@/components/Layout";
import { toast } from "sonner";
import { Copy, Calculator, Download, ShieldAlert, Lightbulb } from "lucide-react";

// India — New Regime brackets (FY 2024-25 baseline)
const IN_SLABS = [
  { upto: 300000, rate: 0 },
  { upto: 700000, rate: 0.05 },
  { upto: 1000000, rate: 0.10 },
  { upto: 1200000, rate: 0.15 },
  { upto: 1500000, rate: 0.20 },
  { upto: Infinity, rate: 0.30 },
];

function computeIndiaTaxNew(income, ded80c, ded80d) {
  // New regime: only standard deduction (75k) applies + rebate; 80C/80D shown as informational only for the estimator
  // For approximate savings estimate, we compute Old-regime style: taxable = income - 50k std - 80C - 80D and use slabs
  const stdDed = 50000; // Old regime std
  let taxable = Math.max(0, income - stdDed - Math.min(ded80c || 0, 150000) - Math.min(ded80d || 0, 100000));
  let remaining = taxable, tax = 0, last = 0;
  for (const s of IN_SLABS) {
    const cap = Math.min(taxable, s.upto);
    const amt = Math.max(0, cap - last);
    tax += amt * s.rate;
    last = cap;
    if (taxable <= s.upto) break;
  }
  tax = tax * 1.04; // 4% cess
  if (income <= 700000) tax = 0; // rebate
  return { taxable, tax: Math.round(tax) };
}

const rateGuess = {
  india: { base: 0.20, dedImpact: 0.30 },
  usa: { base: 0.22, dedImpact: 0.24 },
  uk: { base: 0.20, dedImpact: 0.20 },
  singapore: { base: 0.15, dedImpact: 0.18 },
  uae: { base: 0.0, dedImpact: 0.0 },
  canada: { base: 0.20, dedImpact: 0.22 },
  germany: { base: 0.30, dedImpact: 0.25 },
  australia: { base: 0.22, dedImpact: 0.22 },
};

const countryCurrency = {
  india: "₹", usa: "$", uk: "£", singapore: "S$", uae: "AED ", canada: "C$", germany: "€", australia: "A$",
};

const strategies = [
  { emoji: "🎯", title: "Universal Principles",
    text: "Track every business/education expense. Invest early in tax-advantaged accounts. Understand your filing status."},
  { emoji: "🚀", title: "Creator & Brand Builder",
    text: "Treat your IP/audience as a business asset. Deductible: cameras, laptops, software, home office, courses. Migrate to LLC/Pvt Ltd when income stabilises. Reinvest pre-tax profits into growth."},
  { emoji: "🇮🇳", title: "India: Old vs New",
    text: "Old regime: 80C (₹1.5L), 80D, HRA. New regime: ₹75k std deduction + rebate up to ₹7L. Compute both — pick the lower one."},
  { emoji: "⚠️", title: "Avoid Costly Mistakes",
    text: "Missed deadlines = penalties + interest. Poor record-keeping = audit stress. Not comparing regimes yearly = overpayment."},
];

const countryTips = [
  { flag: "🇺🇸", label: "USA", text: "Max out 401(k)/IRA. HSA for medical costs. Track home office deduction if remote." },
  { flag: "🇬🇧", label: "UK", text: "£20,000/year tax-free ISA. Pension contributions get tax relief. Claim WFH expenses." },
  { flag: "🇸🇬", label: "Singapore", text: "SRS for tax deferral. CPF relief. Parenthood tax rebates." },
  { flag: "🇦🇪", label: "UAE", text: "No personal income tax — but budget for 5% VAT and 9% corporate tax on profits >AED 375k." },
  { flag: "🇩🇪", label: "Germany", text: "Deduct commuting, work equipment, professional development. Church tax deductible." },
  { flag: "🇨🇦", label: "Canada", text: "Max TFSA/RRSP. Claim childcare, moving & tuition credits. Track medical expenses." },
];

export default function SaveSmart() {
  const [income, setIncome] = useState("");
  const [c80, set80] = useState("");
  const [d80, setD80] = useState("");
  const [inResult, setInResult] = useState(null);

  const [gCountry, setGCountry] = useState("india");
  const [gIncome, setGIncome] = useState("");
  const [gDed, setGDed] = useState("");
  const [gResult, setGResult] = useState(null);

  const runIndia = () => {
    const inc = parseFloat(income) || 0;
    if (!inc) { setInResult({ err: "Enter your annual income." }); return; }
    const r = computeIndiaTaxNew(inc, parseFloat(c80) || 0, parseFloat(d80) || 0);
    const withoutDed = computeIndiaTaxNew(inc, 0, 0);
    setInResult({ ...r, saved: withoutDed.tax - r.tax });
  };

  const runGeneral = () => {
    const inc = parseFloat(gIncome) || 0;
    if (!inc) { setGResult({ err: "Enter income to estimate." }); return; }
    const r = rateGuess[gCountry] || rateGuess.india;
    const base = inc * r.base;
    const saved = (parseFloat(gDed) || 0) * r.dedImpact;
    setGResult({ base: Math.round(base), saved: Math.round(saved), final: Math.max(0, Math.round(base - saved)) });
  };

  const copyChecklist = async () => {
    const text = `📋 TaxMaster Pro — Tax Season Checklist
✓ Gather income statements (salary, interest, rent)
✓ Collect investment proofs (80C, 80D, HSA, ISA, etc.)
✓ Save rent receipts & HRA declaration
✓ Compare old vs new regime
✓ File before the deadline
✓ Keep digital + physical copies for 6+ years`;
    try { await navigator.clipboard.writeText(text); toast.success("Checklist copied to clipboard"); }
    catch { toast.error("Copy failed — please select manually"); }
  };

  const downloadReport = () => {
    const lines = [
      "TaxMaster Pro — Tax-Saving Report",
      "=================================",
      "",
      "India (New Regime) estimator",
      inResult?.err ? "  (no input)" : `  Annual income:      ₹${Number(income).toLocaleString("en-IN")}`,
      inResult?.err ? "" : `  80C claimed:        ₹${Number(c80 || 0).toLocaleString("en-IN")}`,
      inResult?.err ? "" : `  80D claimed:        ₹${Number(d80 || 0).toLocaleString("en-IN")}`,
      inResult?.err ? "" : `  Taxable income:     ₹${inResult.taxable.toLocaleString("en-IN")}`,
      inResult?.err ? "" : `  Estimated tax:      ₹${inResult.tax.toLocaleString("en-IN")}`,
      inResult?.err ? "" : `  Estimated savings:  ₹${(inResult.saved || 0).toLocaleString("en-IN")}`,
      "",
      "General estimator",
      gResult?.err ? "  (no input)" : `  Country:            ${gCountry.toUpperCase()}`,
      gResult?.err ? "" : `  Income:             ${countryCurrency[gCountry] || ""}${Number(gIncome).toLocaleString()}`,
      gResult?.err ? "" : `  Deductions claimed: ${countryCurrency[gCountry] || ""}${Number(gDed || 0).toLocaleString()}`,
      gResult?.err ? "" : `  Base tax:           ${countryCurrency[gCountry] || ""}${gResult.base.toLocaleString()}`,
      gResult?.err ? "" : `  Saved:              ${countryCurrency[gCountry] || ""}${gResult.saved.toLocaleString()}`,
      gResult?.err ? "" : `  Final tax:          ${countryCurrency[gCountry] || ""}${gResult.final.toLocaleString()}`,
      "",
      "Reminder: Educational estimate — consult a licensed tax professional.",
      `Generated on ${new Date().toLocaleString()}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `taxmaster-report-${Date.now()}.txt`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <Layout title="Save Smart" subtitle="Practical strategies + calculators to legally lower your tax">
      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-5">
          {strategies.map(s => (
            <section key={s.title} className="tm-card p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg" aria-hidden>{s.emoji}</span>
                <h2 className="font-heading text-lg">{s.title}</h2>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">{s.text}</p>
            </section>
          ))}

          <section className="tm-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator size={17} className="text-[#2563eb]" />
              <h2 className="font-heading text-lg">India Tax Estimator</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <div><label className="tm-label">Annual income (₹)</label>
                <input data-testid="india-income" className="tm-input font-mono" type="number" min="0" value={income} onChange={e => setIncome(e.target.value)} placeholder="e.g., 1200000" />
              </div>
              <div><label className="tm-label">80C investments</label>
                <input data-testid="india-80c" className="tm-input font-mono" type="number" min="0" max="150000" value={c80} onChange={e => set80(e.target.value)} placeholder="Max ₹1,50,000" />
              </div>
              <div><label className="tm-label">80D health ins.</label>
                <input data-testid="india-80d" className="tm-input font-mono" type="number" min="0" value={d80} onChange={e => setD80(e.target.value)} placeholder="Max ₹1,00,000" />
              </div>
            </div>
            <button data-testid="india-calc-btn" onClick={runIndia} className="tm-btn-primary mt-4">Estimate tax</button>
            {inResult && !inResult.err && (
              <div data-testid="india-result" className="mt-4 rounded-lg border border-slate-200 p-4 bg-slate-50/60 grid sm:grid-cols-3 gap-4">
                <ResultRow label="Taxable income" value={`₹${inResult.taxable.toLocaleString("en-IN")}`} />
                <ResultRow label="Estimated tax" value={`₹${inResult.tax.toLocaleString("en-IN")}`} accent="text-slate-900" />
                <ResultRow label="Saved via deductions" value={`₹${(inResult.saved || 0).toLocaleString("en-IN")}`} accent="text-emerald-600" />
              </div>
            )}
            {inResult?.err && <div className="tm-feedback-error mt-3 text-sm">{inResult.err}</div>}
          </section>

          <section className="tm-card p-6">
            <h2 className="font-heading text-lg mb-2">Country-specific quick tips</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {countryTips.map(t => (
                <div key={t.label} className="rounded-lg border border-slate-200 p-3 bg-slate-50/40">
                  <div className="text-sm font-semibold"><span className="mr-1">{t.flag}</span>{t.label}</div>
                  <div className="text-[13px] text-slate-600 mt-1 leading-snug">{t.text}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <section className="tm-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb size={16} className="text-amber-500" />
              <h3 className="font-heading text-base">Quick estimator</h3>
            </div>
            <label className="tm-label">Country</label>
            <select data-testid="calc-country" value={gCountry} onChange={e => setGCountry(e.target.value)} className="tm-input mb-3">
              <option value="india">🇮🇳 India</option>
              <option value="usa">🇺🇸 USA</option>
              <option value="uk">🇬🇧 UK</option>
              <option value="singapore">🇸🇬 Singapore</option>
              <option value="uae">🇦🇪 UAE</option>
              <option value="canada">🇨🇦 Canada</option>
              <option value="germany">🇩🇪 Germany</option>
              <option value="australia">🇦🇺 Australia</option>
            </select>
            <label className="tm-label">Annual income</label>
            <input data-testid="calc-income" className="tm-input font-mono mb-3" type="number" min="0" value={gIncome} onChange={e => setGIncome(e.target.value)} placeholder="Enter amount" />
            <label className="tm-label">Deductions</label>
            <input data-testid="calc-deductions" className="tm-input font-mono mb-3" type="number" min="0" value={gDed} onChange={e => setGDed(e.target.value)} placeholder="e.g., 200000" disabled={gCountry === "uae"} />
            <button data-testid="calc-btn" onClick={runGeneral} className="tm-btn-primary w-full">Estimate</button>
            {gResult && !gResult.err && (
              <div data-testid="calc-result" className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">Base tax</span><span className="font-mono">{countryCurrency[gCountry]}{gResult.base.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Saved</span><span className="font-mono text-emerald-600">-{countryCurrency[gCountry]}{gResult.saved.toLocaleString()}</span></div>
                <div className="flex justify-between border-t border-slate-100 pt-2 mt-1"><span className="text-slate-700 font-semibold">Est. final tax</span><span className="font-mono font-semibold">{countryCurrency[gCountry]}{gResult.final.toLocaleString()}</span></div>
              </div>
            )}
            {gResult?.err && <div className="tm-feedback-error text-xs mt-3">{gResult.err}</div>}
          </section>

          <section className="tm-card p-6">
            <h3 className="font-heading text-base mb-2">Filing checklist</h3>
            <ul className="text-sm text-slate-600 space-y-1.5 mb-4">
              {["Gather income statements", "Collect investment proofs", "Save rent receipts / HRA", "Compare tax regimes", "File before deadline", "Keep records 6+ years"].map(x =>
                <li key={x} className="flex gap-2"><span className="text-emerald-600">✓</span><span>{x}</span></li>
              )}
            </ul>
            <div className="grid grid-cols-2 gap-2">
              <button data-testid="copy-checklist" onClick={copyChecklist} className="tm-btn-outline text-xs inline-flex items-center justify-center gap-1.5">
                <Copy size={12} /> Copy
              </button>
              <button data-testid="download-report" onClick={downloadReport} className="tm-btn-primary text-xs inline-flex items-center justify-center gap-1.5">
                <Download size={12} /> Report
              </button>
            </div>
          </section>

          <section className="tm-card p-5 border-amber-200 bg-amber-50/40">
            <div className="flex gap-2">
              <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong>Disclaimer:</strong> Educational content only. Tax laws change; consult a licensed professional before major decisions.
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

function ResultRow({ label, value, accent = "text-slate-900" }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`font-mono text-lg font-semibold ${accent}`}>{value}</div>
    </div>
  );
}
