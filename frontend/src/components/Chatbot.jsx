import { useEffect, useRef, useState } from "react";
import { MessageSquare, X, Send, Sparkles } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const suggestions = [
  "Explain the New vs Old tax regime in India",
  "How can I save tax legally in the UK?",
  "What's the deadline to file taxes in the USA?",
  "Difference between GST and VAT?",
];

export default function Chatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm TaxMaster AI. Ask me anything about taxes, deductions, or filing." },
  ]);
  const [session, setSession] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  if (!user || user === false) return null;

  const send = async (text) => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);
    try {
      const res = await fetch(`${API_BASE}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ message: text, session_id: session }),
      });
      if (!res.ok || !res.body) {
        throw new Error(`Chat failed (${res.status})`);
      }
      const sid = res.headers.get("X-Session-Id");
      if (sid && !session) setSession(sid);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6);
          if (payload === "[DONE]") continue;
          if (payload.startsWith("[ERROR]")) {
            setMessages((m) => {
              const copy = [...m];
              copy[copy.length - 1] = { role: "assistant", content: "⚠️ " + payload.replace("[ERROR]", "").trim() };
              return copy;
            });
            continue;
          }
          const chunk = payload.replaceAll("\\n", "\n");
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: "assistant", content: (copy[copy.length - 1].content || "") + chunk };
            return copy;
          });
        }
      }
    } catch (e) {
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: "⚠️ Couldn't reach TaxMaster AI. Please try again." };
        return copy;
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-testid="open-chatbot-btn"
        className={`fixed bottom-6 right-6 z-40 shadow-lg rounded-full h-14 w-14 grid place-items-center bg-[#1e3a8a] text-white hover:bg-[#1d4ed8] transition ${open ? "hidden" : ""}`}
        aria-label="Open AI Tax Assistant"
      >
        <MessageSquare size={22} />
      </button>

      {open && (
        <div
          data-testid="chatbot-panel"
          className="fixed bottom-6 right-6 z-40 w-[92vw] max-w-[380px] h-[560px] max-h-[80vh] bg-white rounded-xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden animate-fade-in"
        >
          <div className="bg-[#1e3a8a] text-white px-4 py-3 flex items-center gap-2">
            <Sparkles size={16} />
            <div className="flex-1">
              <div className="font-heading font-semibold text-sm leading-none">TaxMaster AI</div>
              <div className="text-[11px] opacity-80 mt-0.5">Powered by Claude Sonnet 4.5</div>
            </div>
            <button onClick={() => setOpen(false)} data-testid="close-chatbot" aria-label="Close">
              <X size={18} />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto tm-scroll px-4 py-4 space-y-3 bg-slate-50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[13.5px] leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-[#2563eb] text-white" : "bg-white border border-slate-200 text-slate-800"}`}>
                  {m.content || (busy && i === messages.length - 1 ? <span className="opacity-60">Thinking…</span> : null)}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="pt-2 space-y-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    data-testid={`suggest-${s.slice(0, 12)}`}
                    onClick={() => send(s)}
                    disabled={busy}
                    className="w-full text-left text-[12.5px] px-3 py-2 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition text-slate-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="p-3 border-t border-slate-200 flex gap-2 bg-white"
          >
            <input
              data-testid="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={busy ? "Please wait…" : "Ask a tax question…"}
              disabled={busy}
              className="tm-input flex-1"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              data-testid="chat-send-btn"
              className="tm-btn-primary px-3 grid place-items-center"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
