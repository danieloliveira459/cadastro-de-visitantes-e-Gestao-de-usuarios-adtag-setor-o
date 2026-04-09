import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa6";

export default function FormCard() {
  const navigate = useNavigate();

  const API = import.meta.env.VITE_API_URL;

  const [nome, setNome] = useState("");
  const [funcao, setFuncao] = useState("");
  const [telefone, setTelefone] = useState("");
  const [igreja, setIgreja] = useState("");
  const [aceitouJesus, setAceitouJesus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nome.trim() || !funcao.trim() || !telefone.trim() || !igreja.trim()) {
      alert("Preencha todos os campos!");
      return;
    }

    if (aceitouJesus === null) {
      alert("Selecione se o visitante já aceitou Jesus!");
      return;
    }

    try {
      setLoading(true);

      // ✅ Sempre salva na tabela de visitantes
      const response = await fetch(`${API}/api/visitantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          funcao,
          telefone,
          igreja,
          aceitou_jesus: aceitouJesus,
        }),
      });

      if (!response.ok) throw new Error("Erro ao salvar visitante");

      // ✅ Se aceitou Jesus, salva também na tabela aceitaram_jesus
      if (aceitouJesus === true) {
        const responseJesus = await fetch(`${API}/api/aceitaram-jesus`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome,
            telefone,
            endereco: igreja, // usa o campo igreja como endereço/origem
            observacoes: `Função: ${funcao}`,
          }),
        });

        if (!responseJesus.ok) throw new Error("Erro ao salvar em aceitaram Jesus");
      }

      setNome("");
      setFuncao("");
      setTelefone("");
      setIgreja("");
      setAceitouJesus(null);

      window.dispatchEvent(new Event("visitantesAtualizados"));

      // ✅ Redireciona conforme escolha
      if (aceitouJesus === true) {
        navigate("/aceitou-jesus"); // troque pela rota correta
      } else {
        navigate("/pastor");
      }
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

        {/* ✅ Radio Aceitou Jesus */}
        <label style={{ marginTop: "12px" }}>Já aceitou Jesus?</label>
        <div style={{ display: "flex", gap: "16px", marginTop: "6px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <input
              type="radio"
              name="aceitouJesus"
              checked={aceitouJesus === true}
              onChange={() => setAceitouJesus(true)}
            />
            Sim
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
            <input
              type="radio"
              name="aceitouJesus"
              checked={aceitouJesus === false}
              onChange={() => setAceitouJesus(false)}
            />
            Não
          </label>
        </div>

        <button className="btn-submit" type="submit" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar Visitante"}
        </button>
      </form>
    </div>
  );
}