import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  let usuario = null;

  try {
    const data = localStorage.getItem("usuarioLogado");
    if (data && data !== "undefined" && data !== "null") {
      usuario = JSON.parse(data);
    }
  } catch {
    usuario = null;
  }

  // NÃO LOGADO → LOGIN
  if (!token || !usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location, logout: true }}
      />
    );
  }

  // ✅ CORRIGIDO: compara sem forçar uppercase — normaliza os dois lados
  const nivel = usuario?.nivel?.trim().toLowerCase();

  if (
    allowedRoles &&
    (!nivel || !allowedRoles.some((role) => role.trim().toLowerCase() === nivel))
  ) {
      return <Navigate to="/login" replace />;
  }

  return children;
}
