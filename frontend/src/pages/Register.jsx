import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa6";

export default function Register() {
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    alert("Cadastro realizado com sucesso!");
    navigate("/login");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2><FaUserPlus color="#e02020" />Cadastrar Usuário</h2>
        <form onSubmit={handleRegister}>
          <input type="text" placeholder="Nome" required />
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Senha" required />
          <button type="submit" className="btn-login">Cadastrar</button>
        </form>
      </div>
    </div>
  );
}