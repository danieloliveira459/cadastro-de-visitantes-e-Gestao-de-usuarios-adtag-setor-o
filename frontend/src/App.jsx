import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

function getUsuario() {
  const data = localStorage.getItem("usuarioLogado");
  if (!data || data === "undefined" || data === "null") return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

const ROLES = {
  todos: [
    "adm",
    "pastor",
    "vice pastor",
    "pastor dirigente",
    "secretário",
    "tesoureiro",
    "recepcionista",
    "diácono",
    "diaconisa",
  ],
  lideranca: [
    "adm",
    "pastor",
    "vice pastor",
    "pastor dirigente",
    "secretário",
    "tesoureiro",
  ],
  recepcao: [
    "adm",
    "pastor",
    "vice pastor",
    "pastor dirigente",
    "secretário",
    "tesoureiro",
    "recepcionista",
  ],
};

export default function App() {
  const [usuario, setUsuario] = useState(getUsuario);

  useEffect(() => {
    const handleAuth = () => setUsuario(getUsuario());
    window.addEventListener("storage", handleAuth);
    window.addEventListener("auth-change", handleAuth);
    return () => {
      window.removeEventListener("storage", handleAuth);
      window.removeEventListener("auth-change", handleAuth);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* ROTA INICIAL */}
        <Route
          path="/"
          element={usuario ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
        />

        {/* ROTAS PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["adm"]}>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* HOME */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={ROLES.todos}>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* PAINEL DO PASTOR */}
        <Route
          path="/pastor"
          element={
            <ProtectedRoute allowedRoles={ROLES.lideranca}>
              <Pastor />
            </ProtectedRoute>
          }
        />

        {/* ACEITARAM JESUS */}
        <Route
          path="/aceitaram-jesus"
          element={
            <ProtectedRoute allowedRoles={ROLES.todos}>
              <AceitaramJesus />
            </ProtectedRoute>
          }
        />

        {/* MEMBROS */}
        <Route
          path="/membros"
          element={
            <ProtectedRoute allowedRoles={ROLES.lideranca}>
              <Membros />
            </ProtectedRoute>
          }
        />

        {/* QR CODE */}
        <Route
          path="/qrcode"
          element={
            <ProtectedRoute allowedRoles={ROLES.recepcao}>
              <Qrcode />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route
          path="*"
          element={usuario ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}
