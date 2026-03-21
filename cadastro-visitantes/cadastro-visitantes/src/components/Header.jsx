import { FaUserPlus } from "react-icons/fa6";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation(); // pega rota atual

  const isPastor = location.pathname === "/pastor";

  return (
    <header className="header">
      
      <div className="logo">ADTAG Expansão do Setor "O"</div>

      <h1 className="titulo">
        Sistema de Cadastro de Visitantes
      </h1>

      <div className="acoes">
        <button 
          className={`btn-primary ${!isPastor ? "active" : ""}`}
          onClick={() => navigate("/")}
        >
          <FaUserPlus />
          Cadastrar Visitante
        </button>

        <button 
          className={`btn-outline ${isPastor ? "active-outline" : ""}`}
          onClick={() => navigate("/pastor")}
        >
          Painel do Pastor
        </button>
      </div>

    </header>
  );
}