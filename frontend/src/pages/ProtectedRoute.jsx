import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  let usuario = null;

  //  Proteção contra JSON inválido
  try {
    const data = localStorage.getItem("usuarioLogado");

    if (data && data !== "undefined" && data !== "null") {
      usuario = JSON.parse(data);
    }
  } catch (error) {
    console.warn("Erro ao ler usuário do localStorage");
    usuario = null;
  }

  //  NÃO LOGADO → LOGIN (COM CONTROLE DE LOGOUT)
  if (!token || !usuario) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          logout: true, // 🔥 ESSENCIAL PRA NÃO DAR LOOP
        }}
      />
    );
  }

  //  VERIFICA PERMISSÃO
  const nivel = usuario?.nivel?.toUpperCase();

  if (allowedRoles && (!nivel || !allowedRoles.includes(nivel))) {
    return <Navigate to="/home" replace />;
  }

  //  LIBERADO
  return children;
}