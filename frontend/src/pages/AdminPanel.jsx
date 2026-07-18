import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { api, formatApiError } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Save, Trash2, X } from "lucide-react";

const emptyCountry = () => ({
  key: "",
  region: "",
  info: { type: "", personal: "", corp: "", consumption: "", filing: "" },
  notes: "",
  quiz: [],
});

export default function AdminPanel() {
  const [countries, setCountries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/countries").then(({ data }) => setCountries(data.countries || []));

  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing(emptyCountry()); setIsNew(true); };
  const startEdit = (c) => { setEditing(JSON.parse(JSON.stringify(c))); setIsNew(false); };

  const save = async () => {
    setBusy(true);
    try {
      if (isNew) await api.post("/countries", editing);
      else await api.put(`/countries/${encodeURIComponent(editing.key)}`, editing);
      toast.success("Saved");
      setEditing(null);
      await load();
    } catch (e) { toast.error(formatApiError(e)); }
    finally { setBusy(false); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete ${c.key}?`)) return;
    try { await api.delete(`/countries/${encodeURIComponent(c.key)}`); toast.success("Deleted"); await load(); }
    catch (e) { toast.error(formatApiError(e)); }
  };

  return (
    <Layout title="Admin Panel" subtitle="Manage country tax data & quizzes">
      <div className="flex justify-between items-center mb-5">
        <div className="text-sm text-slate-500">{countries.length} countries in the database</div>
        <button data-testid="admin-add-country" onClick={startNew} className="tm-btn-primary inline-flex items-center gap-1.5">
          <Plus size={14} /> Add country
        </button>
      </div>

      <div className="tm-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-widest text-slate-500">
            <tr>
              <th className="text-left px-5 py-3 font-medium">Key</th>
              <th className="text-left px-5 py-3 font-medium">Region</th>
              <th className="text-left px-5 py-3 font-medium">Personal</th>
              <th className="text-left px-5 py-3 font-medium">Corp</th>
              <th className="text-right px-5 py-3 font-medium">Quiz Qs</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {countries.map(c => (
              <tr key={c.key} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-5 py-3 font-medium">{c.key}</td>
                <td className="px-5 py-3">{c.region}</td>
                <td className="px-5 py-3 font-mono text-slate-600">{c.info?.personal || "—"}</td>
                <td className="px-5 py-3 font-mono text-slate-600">{c.info?.corp || "—"}</td>
                <td className="px-5 py-3 text-right font-mono">{c.quiz?.length || 0}</td>
                <td className="px-5 py-3 text-right space-x-1.5">
                  <button data-testid={`edit-${encodeURIComponent(c.key)}`} onClick={() => startEdit(c)} className="tm-btn-outline text-xs">Edit</button>
                  <button data-testid={`delete-${encodeURIComponent(c.key)}`} onClick={() => remove(c)} className="tm-btn-outline text-xs text-red-600"><Trash2 size={12} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 grid place-items-center p-4" onClick={() => setEditing(null)}>
          <div onClick={e => e.stopPropagation()}
            className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl max-h-[92vh] overflow-y-auto tm-scroll">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center">
              <div className="font-heading text-lg">{isNew ? "Add country" : `Edit: ${editing.key}`}</div>
              <button className="ml-auto p-1" onClick={() => setEditing(null)}><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className="tm-label">Key (e.g., 🇮🇳 India)</label>
                  <input className="tm-input" value={editing.key} onChange={e => setEditing({ ...editing, key: e.target.value })} disabled={!isNew} /></div>
                <div><label className="tm-label">Region</label>
                  <input className="tm-input" value={editing.region} onChange={e => setEditing({ ...editing, region: e.target.value })} /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {["type", "personal", "corp", "consumption", "filing"].map(k =>
                  <div key={k}>
                    <label className="tm-label">{k}</label>
                    <input className="tm-input" value={editing.info[k] || ""}
                      onChange={e => setEditing({ ...editing, info: { ...editing.info, [k]: e.target.value } })} />
                  </div>
                )}
              </div>
              <div>
                <label className="tm-label">Notes</label>
                <textarea data-testid="admin-notes" className="tm-input min-h-[80px]" value={editing.notes}
                  onChange={e => setEditing({ ...editing, notes: e.target.value })} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="tm-label m-0">Quiz questions ({editing.quiz.length})</label>
                  <button onClick={() => setEditing({ ...editing, quiz: [...editing.quiz, { q: "", opts: ["", "", "", ""], correct: 0, exp: "" }] })}
                    className="tm-btn-outline text-xs inline-flex items-center gap-1"><Plus size={11} /> Add</button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto tm-scroll pr-2">
                  {editing.quiz.map((quiz, qi) => (
                    <div key={`q-${qi}-${(quiz.q || "").slice(0, 24)}`} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-xs font-mono text-slate-500">Q{qi + 1}</div>
                        <button onClick={() => setEditing({ ...editing, quiz: editing.quiz.filter((_, i) => i !== qi) })}
                          className="ml-auto text-red-500 text-xs"><Trash2 size={11} /></button>
                      </div>
                      <input className="tm-input mb-2" value={quiz.q} placeholder="Question"
                        onChange={e => { const q = [...editing.quiz]; q[qi].q = e.target.value; setEditing({ ...editing, quiz: q }); }} />
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {quiz.opts.map((opt, oi) => (
                          <div key={`opt-${qi}-${oi}`} className="flex items-center gap-1.5">
                            <input type="radio" name={`c-${qi}`} checked={quiz.correct === oi}
                              onChange={() => { const q = [...editing.quiz]; q[qi].correct = oi; setEditing({ ...editing, quiz: q }); }} />
                            <input className="tm-input flex-1 text-sm" value={opt}
                              onChange={e => { const q = [...editing.quiz]; q[qi].opts[oi] = e.target.value; setEditing({ ...editing, quiz: q }); }} />
                          </div>
                        ))}
                      </div>
                      <input className="tm-input text-sm" value={quiz.exp} placeholder="Explanation"
                        onChange={e => { const q = [...editing.quiz]; q[qi].exp = e.target.value; setEditing({ ...editing, quiz: q }); }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
              <button onClick={() => setEditing(null)} className="tm-btn-outline">Cancel</button>
              <button data-testid="admin-save" onClick={save} disabled={busy} className="tm-btn-primary inline-flex items-center gap-1.5">
                <Save size={14} /> {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
