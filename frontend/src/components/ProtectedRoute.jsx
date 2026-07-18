import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (user === null) return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <div className="text-slate-500 text-sm">Loading…</div>
    </div>
  );
  if (user === false) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}
