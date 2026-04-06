import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa6";

export default function FormCard() {
  const navigate = useNavigate();

  // garante string segura
  const API = import.meta.env.VITE_API_URL;

  const [nome, setNome] = useState("");
  const [funcao, setFuncao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [igreja, setIgreja] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome.trim() || !funcao.trim() || !telefone.trim() || !igreja.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API}/api/visitantes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          funcao,
          telefone,
          igreja,
          data: new Date().toISOString(),
        }),
      });

      // 🔥 MELHOR DEBUG DE ERRO (IMPORTANTE)
      if (!response.ok) {
        const erro = await response.text();
        console.error("Erro backend:", erro);
        throw new Error("Erro ao salvar no banco");
      }

      alert("Visitante cadastrado com sucesso!");

      setNome("");
      setFuncao("");
      setTelefone("");
      setIgreja("");

      navigate("/pastor");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar visitante");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <FaUserPlus className="icon" />
        Cadastro de Visitante
      </h2>

      <form onSubmit={handleSubmit}>
        <label>Nome</label>
        <input
          placeholder="Ex: Carlos"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />

        <label>Função/ND</label>
        <input
          placeholder="Ex: Membro, Pastor, Líder, etc."
          value={funcao}
          onChange={(e) => setFuncao(e.target.value)}
        />

        <label>Telefone</label>
        <input
          placeholder="(00)00000-0000"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        <label>Igreja / Visitando</label>
        <input
          placeholder="Ex: Igreja do Visitante"
          value={igreja}
          onChange={(e) => setIgreja(e.target.value)}
        />

        <button className="btn-submit" type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar Visitante"}
        </button>
      </form>
    </div>
  );
}