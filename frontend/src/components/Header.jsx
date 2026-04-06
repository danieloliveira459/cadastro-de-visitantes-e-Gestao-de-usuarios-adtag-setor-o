import { FaUserPlus, FaRightFromBracket } from "react-icons/fa6";
import { PiUserSwitchLight } from "react-icons/pi";
import { RiAdminFill } from "react-icons/ri";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import "./Header.css";
import adtagLogo from "../assets/adtag.png";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isPastor = location.pathname === "/pastor";
  const isAceitaramJesus = location.pathname === "/aceitaram-jesus";

  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  } catch {
    usuario = null;
  }

  // 🔒 PROTEÇÃO: se não estiver logado, redireciona
  useEffect(() => {
    if (!usuario) {
      navigate("/login", { replace: true });
    }
  }, [usuario, navigate]);

  // 🚪 LOGOUT CORRETO
  const handleLogout = () => {
    localStorage.removeItem("usuarioLogado");

    // ✅ usar navigate (evita tela preta)
    navigate("/login", { replace: true });
  };

  return (
    <header className="header">
      {/* LOGO + NOME */}
      <div
        className="logo-container"
        onClick={() => navigate("/home")}
        style={{ cursor: "pointer" }}
      >
        <img src={adtagLogo} alt="ADTAG Logo" className="logo-img" />
        <span className="logo-text">ADTAG</span>
      </div>

      <h1 className="titulo">
        Sistema de recepção, acompanhamento e gestão de visitantes
      </h1>

      <div className="acoes">
        <button
          className={`btn-outline ${
            !isPastor && !isAceitaramJesus ? "active-outline" : ""
          }`}
          onClick={() => navigate("/home")}
        >
          <FaUserPlus /> Cadastrar Visitante
        </button>

        <button
          className={`btn-outline ${
            isAceitaramJesus ? "active-outline" : ""
          }`}
          onClick={() => navigate("/aceitaram-jesus")}
        >
          <PiUserSwitchLight color="#e02020" /> Cadastrar quem aceitou Jesus
        </button>

        <button
          className={`btn-outline ${isPastor ? "active-outline" : ""}`}
          onClick={() => navigate("/pastor")}
        >
          Painel do Pastor
        </button>

        <span className="usuario-logado">
          <RiAdminFill />
          {usuario?.nome || "Usuário"}
        </span>

        <button className="btn-logout" onClick={handleLogout}>
          <FaRightFromBracket /> Logout
        </button>
      </div>
    </header>
  );
}