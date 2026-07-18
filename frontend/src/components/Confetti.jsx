import { useEffect, useState } from "react";

// Lightweight, one-shot CSS confetti burst.
// Usage: <Confetti fire={someKey} />  — change fire to a new value to trigger.
export default function Confetti({ fire }) {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (fire === null || fire === undefined || fire === 0) return;
    const colors = ["#2563eb", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#0ea5e9"];
    const next = Array.from({ length: 26 }, (_, i) => ({
      id: `${fire}-${i}`,
      left: 10 + Math.random() * 80,
      delay: Math.random() * 0.25,
      duration: 1.4 + Math.random() * 1.1,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: Math.floor(Math.random() * 360),
      size: 6 + Math.floor(Math.random() * 6),
    }));
    setPieces(next);
    const t = setTimeout(() => setPieces([]), 2600);
    return () => clearTimeout(t);
  }, [fire]);

  if (pieces.length === 0) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: "absolute",
            top: "-12px",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size + 4}px`,
            background: p.color,
            borderRadius: "2px",
            transform: `rotate(${p.rotate}deg)`,
            animation: `tm-fall ${p.duration}s ${p.delay}s cubic-bezier(.2,.6,.4,1) forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes tm-fall {
          to { transform: translateY(105vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
