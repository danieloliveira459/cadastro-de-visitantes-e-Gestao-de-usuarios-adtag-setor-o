import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Pastor from "./pages/Pastor";
import Admin from "./pages/Admin";
import ProtectedRoute from "./pages/ProtectedRoute";
import AceitaramJesus from "./pages/AceitaramJesus";
import ResetPassword from "./pages/ResetPasword"; 

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

export default function App() {
  const [usuario, setUsuario] = useState(getUsuario());

  //  Atualiza se localStorage mudar (login/logout)
  useEffect(() => {
    const handleStorage = () => {
      setUsuario(getUsuario());
    };

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

        {/* PÚBLICAS */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* RESET PASSWORD (PÚBLICA) */}
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

        {/* FALLBACK INTELIGENTE */}
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