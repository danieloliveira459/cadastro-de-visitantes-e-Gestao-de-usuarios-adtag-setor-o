import { FaUserPlus, FaRightFromBracket } from "react-icons/fa6";
import { PiUserSwitchLight } from "react-icons/pi";
import { RiAdminFill } from "react-icons/ri";
import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

// ✅ Logo na pasta public
const logoPath = "/assets/adtag.png";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔥 Verifica rota ativa
  const isActive = (path) => location.pathname === path;

  // 🔐 Usuário logado (seguro)
  let usuario = null;
  try {
    const stored = localStorage.getItem("usuarioLogado");
    usuario = stored && stored !== "undefined" ? JSON.parse(stored) : null;
  } catch {
    usuario = null;
  }

  // 🔓 Logout completo
  function handleLogout() {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  //  Navegação segura (evita clicar na mesma rota)
  function goTo(path) {
    if (location.pathname !== path) {
      navigate(path);
    }
  }

  return (
    <header className="header">
      <h1 className="ADTAG">
        <img
          src={logoPath}
          alt="ADTAG Logo"
          className="logo-inline"
          onError={(e) => (e.target.style.display = "none")} //  evita quebrar layout
        />
        Sistema de recepção, acompanhamento e gestão de visitantes
      </h1>

      <div className="acoes">
        <button
          className={`btn-outline ${isActive("/home") ? "active-outline" : ""}`}
          onClick={() => goTo("/home")}
        >
          <FaUserPlus /> Cadastrar Visitante
        </button>

        <button
          className={`btn-outline ${isActive("/aceitaram-jesus") ? "active-outline" : ""}`}
          onClick={() => goTo("/aceitaram-jesus")}
        >
          <PiUserSwitchLight color="#e02020" />
          Cadastrar quem aceitou Jesus
        </button>

        <button
          className={`btn-outline ${isActive("/pastor") ? "active-outline" : ""}`}
          onClick={() => goTo("/pastor")}
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