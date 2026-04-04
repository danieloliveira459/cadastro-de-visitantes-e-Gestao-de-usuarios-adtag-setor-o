import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  let usuario = null;

  try {
    const data = localStorage.getItem("usuarioLogado");

    if (data && data !== "undefined") {
      usuario = JSON.parse(data);
    }
  } catch {
    usuario = null;
  }
  // NÃO LOGADO → LOGIN
  if (!usuario) {
    // evita loop infinito
    if (location.pathname !== "/login") {
      return <Navigate to="/login" replace />;
    }

    return null;
  }
  //  VERIFICA PERMISSÃ
  const nivel = usuario.nivel?.toUpperCase();

  if (allowedRoles && (!nivel || !allowedRoles.includes(nivel))) {
    // evita ficar redirecionando sem parar
    if (location.pathname !== "/home") {
      return <Navigate to="/home" replace />;
    }

    return null;
  }
  return children;
}