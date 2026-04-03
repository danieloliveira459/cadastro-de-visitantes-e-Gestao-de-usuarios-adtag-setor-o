import { FaUserPlus, FaUserSlash, FaRightFromBracket } from "react-icons/fa6";
import { PiUserSwitchLight } from "react-icons/pi";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";
import { RiAdminFill } from "react-icons/ri";
import { GiChurch } from "react-icons/gi";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isPastor = location.pathname === "/pastor";
  const isAceitaramJesus = location.pathname === "/aceitaram-jesus";

  // forma segura
  let usuario = null;

  try {
    usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  } catch {
    usuario = null;
  }

  function handleLogout() {
    localStorage.removeItem("usuarioLogado");
    navigate("/login");
  }

  return (
    <header className="header">
      <div className="logo">ADTAG</div>
      <h1 className="titulo">Sistema de recepção, acompanhamento e gestão de visitantes <GiChurch color="#e02020"/></h1>

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
          <PiUserSwitchLight color="#e02020"/> Cadastrar quem aceitou Jesus
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