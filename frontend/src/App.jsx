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
import MembrosPublico from "./pages/MembrosPublico";

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

//  Lê o parâmetro ?qr= da URL (usado pelo QR Code)
function getAbaQR() {
  const params = new URLSearchParams(window.location.search);
  return params.get("qr"); // ex: ?qr=criancas
}

export default function App() {
  const [usuario, setUsuario] = useState(getUsuario());

  //  Se vier ?qr=criancas na URL, exibe a página pública como overlay
  const [abaQR, setAbaQR] = useState(getAbaQR());

  useEffect(() => {
    const handleStorage = () => setUsuario(getUsuario());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  //  Se houver ?qr= na URL, exibe MembrosPublico diretamente — sem login
  if (abaQR) {
    return <MembrosPublico abaInicial={abaQR} />;
  }

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

        {/* FALLBACK */}
        <Route
          path="*"
          element={
            usuario
              ? <Navigate to="/home" replace />
              : <Navigate to="/login" replace />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
