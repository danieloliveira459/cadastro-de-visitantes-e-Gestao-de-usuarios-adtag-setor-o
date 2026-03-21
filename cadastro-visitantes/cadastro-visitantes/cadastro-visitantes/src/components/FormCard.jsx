import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { FaUserPlus } from "react-icons/fa6";

export default function FormCard() {
  const navigate = useNavigate(); 

  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [igreja, setIgreja] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // validação simples
    if (!nome || !cargo || !telefone || !igreja) {
      alert("Preencha todos os campos!");
      return;
    }

    const visitante = {
      nome,
      cargo,
      telefone,
      igreja,
      data: new Date().toLocaleString(),
    };

    const lista = JSON.parse(localStorage.getItem("visitantes")) || [];

    lista.push(visitante);

    localStorage.setItem("visitantes", JSON.stringify(lista));

    //  REDIRECIONA PRO PAINEL
    navigate("/pastor");

    // limpar campos
    setNome("");
    setCargo("");
    setTelefone("");
    setIgreja("");
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <FaUserPlus className="icon" />
        Cadastro de Visitante
      </h2>

      <form onSubmit={handleSubmit}>
        <label>Nome Completo</label>
        <input
          placeholder="Ex: Carlos"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <label>Cargo</label>
        <input
          placeholder="Ex: Membro, Pastor, Líder, etc."
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
        />

        <label>Telefone</label>
        <input
          placeholder="(00)00000-0000"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <label>Igreja</label>
        <input
          placeholder="Ex: Igreja do Visitante"
          value={igreja}
          onChange={(e) => setIgreja(e.target.value)}
        />

        <button className="btn-submit" type="submit">
          Cadastrar Visitante
        </button>
      </form>
    </div>
  );
}