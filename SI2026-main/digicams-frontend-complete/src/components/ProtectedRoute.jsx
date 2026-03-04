import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — cuva rute od neovlascenog pristupa.
 *
 * Upotreba:
 *   <ProtectedRoute>                        — samo ulogovani
 *   <ProtectedRoute roles={["Seller","Admin"]}> — samo Prodavac ili Admin
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // Cekamo dok se user ucita iz localStorage

  // Nije ulogovan — saljemo na login
  if (!user) return <Navigate to="/login" replace />;

  // Rola nije dozvoljena — saljemo na pocetnu
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;