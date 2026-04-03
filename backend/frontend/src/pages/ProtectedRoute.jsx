import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  } catch {
    usuario = null;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  //  USA O CAMPO CERTO
  const nivel = usuario.nivel?.toUpperCase();

  if (allowedRoles && (!nivel || !allowedRoles.includes(nivel))) {
    return <Navigate to="/home" replace />;
  }

  return children;
}