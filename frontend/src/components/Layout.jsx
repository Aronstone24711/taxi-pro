import Sidebar from "./Sidebar";
import Chatbot from "./Chatbot";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LogIn } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const mobileLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/quiz", label: "Indian Quiz" },
  { to: "/explorer", label: "World Explorer" },
  { to: "/save-smart", label: "Save Smart" },
  { to: "/leaderboard", label: "Leaderboard" },
];

export default function Layout({ children, title, subtitle }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-[#f8fafc]">
      <Sidebar />

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/40" />
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="font-heading font-bold">TaxMaster Pro</div>
              <button onClick={() => setOpen(false)} data-testid="mobile-close">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-1">
              {mobileLinks.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `tm-nav-link ${isActive ? "active" : ""}`}
                >
                  {l.label}
                </NavLink>
              ))}
              {user?.role === "admin" && (
                <NavLink to="/admin" onClick={() => setOpen(false)}
                  className={({ isActive }) => `tm-nav-link ${isActive ? "active" : ""}`}>
                  Admin
                </NavLink>
              )}
            </div>
            <div className="mt-auto">
              {user && user !== false ? (
                <button onClick={async () => { await logout(); navigate("/login"); }}
                  className="tm-btn-outline w-full flex items-center justify-center gap-2">
                  <LogOut size={14} /> Sign out
                </button>
              ) : (
                <button onClick={() => navigate("/login")}
                  className="tm-btn-primary w-full flex items-center justify-center gap-2">
                  <LogIn size={14} /> Sign in
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
          <div className="px-5 sm:px-8 py-4 flex items-center gap-3">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setOpen(true)}
              data-testid="mobile-menu-btn"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0">
              {title && <h1 className="font-heading text-xl sm:text-2xl tracking-tight leading-none">{title}</h1>}
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            <div className="ml-auto flex items-center gap-3">
              {user && user !== false && (
                <span className="tm-badge" data-testid="topbar-streak">
                  <span className="font-mono">{user.current_streak || 0}</span>&nbsp;streak
                </span>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-5 sm:px-8 py-6 max-w-7xl w-full">
          {children}
        </main>

        <footer className="px-5 sm:px-8 py-6 text-xs text-slate-500 border-t border-slate-200 bg-white">
          Data reflects FY 2024-25 / 2026 baselines. Tax laws change frequently — verify with official sources before financial decisions.
        </footer>
      </div>

      <Chatbot />
    </div>
  );
}
