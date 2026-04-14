import { FaUserPlus, FaRightFromBracket, FaBookOpen } from "react-icons/fa6";
import { PiUserSwitchLight } from "react-icons/pi";
import { RiAdminFill } from "react-icons/ri";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import "./Header.css";
import adtagLogo from "../assets/adtag.png";
import manualPDF from "../assets/manual_sistema_Recepção_ (1).pdf";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggingOut = useRef(false);
  const menuRef = useRef(null);
  const [menuAberto, setMenuAberto] = useState(false);

  const isPastor = location.pathname === "/pastor";
  const isAceitaramJesus = location.pathname === "/aceitaram-jesus";

  let usuario = null;
  try {
    usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  } catch {
    usuario = null;
  }

  useEffect(() => {
    if (!usuario && !isLoggingOut.current) {
      navigate("/login", { replace: true });
    }
  }, [usuario, navigate]);

  useEffect(() => {
    const handleClickFora = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const handleLogout = () => {
    isLoggingOut.current = true;
    localStorage.removeItem("usuarioLogado");
    navigate("/login", { replace: true });
  };

  // ✅ Agora abre o PDF de verdade
  const handleManual = () => {
    window.open(manualPDF, "_blank");
    setMenuAberto(false);
  };

  const iniciais = usuario?.nome
    ? usuario.nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  return (
    <header className="header">
      <div
        className="logo-container"
        onClick={() => navigate("/home")}
        style={{ cursor: "pointer" }}
      >
        <img src={adtagLogo} alt="ADTAG Logo" className="logo-img" />
        <span className="logo-text">ADTAG Expansão Setor "O"</span>
      </div>

      <h1 className="titulo">
        Sistema de recepção, acompanhamento e gestão de visitantes
      </h1>

      <div className="acoes">
        <button
          className={`btn-outline ${!isPastor && !isAceitaramJesus ? "active-outline" : ""}`}
          onClick={() => navigate("/home")}
        >
          <FaUserPlus /> Cadastrar Visitante
        </button>

        <button
          className={`btn-outline ${isAceitaramJesus ? "active-outline" : ""}`}
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

        {/* MENU HAMBÚRGUER */}
        <div className="menu-wrapper" ref={menuRef}>
          <button
            className={`btn-hamburguer ${menuAberto ? "aberto" : ""}`}
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Menu do usuário"
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>

          {menuAberto && (
            <div className="dropdown-menu">
              <div className="menu-usuario">
                <div className="avatar">{iniciais}</div>
                <div>
                  <span className="menu-nome">{usuario?.nome || "Usuário"}</span>
                  <span className="menu-nivel">
                    <RiAdminFill /> {usuario?.nivel || ""}
                  </span>
                </div>
              </div>

              <div className="menu-divider" />

              <button className="menu-item" onClick={handleManual}>
                <FaBookOpen />
                Manual do usuário
                <span className="badge-pdf">PDF</span>
              </button>

              <div className="menu-divider" />

              <button className="menu-item danger" onClick={handleLogout}>
                <FaRightFromBracket />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}