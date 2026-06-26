import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, checked } = useAuth();
  if (!checked || user === null) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Načítání…</div>;
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}
