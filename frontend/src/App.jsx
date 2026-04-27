import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Pastor from "./pages/Pastor";
import Admin from "./pages/Admin";
import ProtectedRoute from "./pages/ProtectedRoute";
import AceitaramJesus from "./pages/AceitaramJesus";
import ResetPassword from "./pages/ResetPassword";
import Membros from "./pages/CadastroMembros";
import Qrcode from "./pages/QrExport";
import MembrosPublico from "./pages/MembrosPublico"; 

// ================= ROTAS PÚBLICAS — nunca exigem login =================
const ROTAS_PUBLICAS = [
  "/login",
  "/register",
  "/reset",
  "/membros/publico", 
];

// FUNÇÃO SEGURA
function getUsuario() {
  const data = localStorage.getItem("usuarioLogado");
  if (!data || data === "undefined") return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// ================= FALLBACK INTELIGENTE =================
// Só redireciona se a rota não for pública
function FallbackRoute({ usuario }) {
  const location = useLocation();

  const isPublica = ROTAS_PUBLICAS.some((rota) =>
    location.pathname.startsWith(rota)
  );

  // Se for rota pública, não faz nada (deixa o React Router tratar)
  if (isPublica) return null;

  return usuario
    ? <Navigate to="/home" replace />
    : <Navigate to="/login" replace />;
}

export default function App() {
  const [usuario, setUsuario] = useState(getUsuario());

  useEffect(() => {
    const handleStorage = () => setUsuario(getUsuario());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* ROTA INICIAL */}
        <Route
          path="/"
          element={
            usuario
              ? <Navigate to="/home" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/*  ROTA PÚBLICA DO QR CODE — sem login, deve vir antes do fallback */}
        <Route path="/membros/publico" element={<MembrosPublico />} />

        {/* ROTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADM"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* HOME */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["ADM","PASTOR","VICE","DIRIGENTE","ATENDENTE","USER"]}>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* PASTOR */}
        <Route
          path="/pastor"
          element={
            <ProtectedRoute allowedRoles={["ADM","PASTOR","VICE","DIRIGENTE"]}>
              <Pastor />
            </ProtectedRoute>
          }
        />

        {/* ACEITARAM JESUS */}
        <Route
          path="/aceitaram-jesus"
          element={
            <ProtectedRoute allowedRoles={["ADM","PASTOR","VICE","DIRIGENTE","ATENDENTE","USER"]}>
              <AceitaramJesus />
            </ProtectedRoute>
          }
        />

        {/* MEMBROS (protegido) */}
        <Route
          path="/membros"
          element={
            <ProtectedRoute allowedRoles={["ADM","PASTOR","VICE","DIRIGENTE","ATENDENTE"]}>
              <Membros />
            </ProtectedRoute>
          }
        />

        {/* QR CODE (protegido) */}
        <Route
          path="/qrcode"
          element={
            <ProtectedRoute allowedRoles={["ADM","PASTOR","VICE","DIRIGENTE","ATENDENTE"]}>
              <Qrcode />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK — só redireciona rotas desconhecidas */}
        <Route path="*" element={<FallbackRoute usuario={usuario} />} />

      </Routes>
    </BrowserRouter>
  );
}
