import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, BookOpen, Globe2, PiggyBank, Trophy,
  Settings, LogOut, LogIn, User as UserIcon, Home
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const publicLinks = [
  { to: "/quiz",        label: "Indian Quiz",    icon: BookOpen, testId: "nav-quiz" },
  { to: "/explorer",    label: "World Explorer", icon: Globe2,   testId: "nav-explorer" },
  { to: "/save-smart",  label: "Save Smart",     icon: PiggyBank,testId: "nav-savesmart" },
  { to: "/leaderboard", label: "Leaderboard",    icon: Trophy,   testId: "nav-leaderboard" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAuthed = user && user !== false;

  const handleLogout = async () => { await logout(); navigate("/"); };

  return (
    <aside
      data-testid="app-sidebar"
      className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-slate-200 bg-white h-screen sticky top-0"
    >
      <Link to="/" data-testid="brand-home" className="px-5 pt-6 pb-5 border-b border-slate-200 block hover:bg-slate-50 transition">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#1e3a8a] text-white grid place-items-center font-heading font-bold">T</div>
          <div>
            <div className="font-heading font-bold text-[15px] leading-none">TaxQuest</div>
            <div className="text-[11px] text-slate-500 mt-0.5 tracking-wider uppercase">LEARN · PLAY · WIN</div>
          </div>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1 tm-scroll overflow-y-auto">
        <NavLink to="/" end data-testid="nav-home" className={({ isActive }) => `tm-nav-link ${isActive ? "active" : ""}`}>
          <Home size={17} /><span>Home</span>
        </NavLink>
        {isAuthed && (
          <NavLink to="/dashboard" data-testid="nav-dashboard" className={({ isActive }) => `tm-nav-link ${isActive ? "active" : ""}`}>
            <LayoutDashboard size={17} /><span>My Dashboard</span>
          </NavLink>
        )}
        {publicLinks.map(({ to, label, icon: Icon, testId }) => (
          <NavLink
            key={to}
            to={to}
            data-testid={testId}
            className={({ isActive }) => `tm-nav-link ${isActive ? "active" : ""}`}
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
        {isAuthed && user.role === "admin" && (
          <NavLink to="/admin" data-testid="nav-admin" className={({ isActive }) => `tm-nav-link ${isActive ? "active" : ""}`}>
            <Settings size={17} /><span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-slate-200">
        {isAuthed ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#1e3a8a] grid place-items-center">
                <UserIcon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold truncate">{user.name}</div>
                <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
              </div>
            </div>
            <button data-testid="logout-btn" onClick={handleLogout} className="tm-btn-outline w-full flex items-center justify-center gap-2 text-[13px]">
              <LogOut size={14} /> Sign out
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-[11.5px] text-slate-500 leading-snug px-1">
              Playing as guest. Sign in to save your streak & rank on the leaderboard.
            </div>
            <button data-testid="sidebar-login-btn" onClick={() => navigate("/login")}
              className="tm-btn-primary w-full flex items-center justify-center gap-2 text-[13px]">
              <LogIn size={14} /> Sign in
            </button>
            <button data-testid="sidebar-signup-btn" onClick={() => navigate("/register")}
              className="tm-btn-outline w-full text-[12.5px]">
              Create free account
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
