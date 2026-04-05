import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  let usuario = null;
  const token = localStorage.getItem("token");

  try {
    const data = localStorage.getItem("usuarioLogado");

    if (data && data !== "undefined") {
      usuario = JSON.parse(data);
    }
  } catch {
    usuario = null;
  }

  //  NÃO LOGADO → LOGIN
  if (!usuario || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  //  VERIFICA PERMISSÃO
  const nivel = usuario?.nivel?.toUpperCase();

  if (allowedRoles && (!nivel || !allowedRoles.includes(nivel))) {
    return <Navigate to="/home" replace />;
  }

  //  LIBERADO
  return children;
}