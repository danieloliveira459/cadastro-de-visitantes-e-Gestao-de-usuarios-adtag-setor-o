import Header from "../components/Header";
import "./AceitaramJesus.css";
import { useEffect, useState } from "react";
import { FaUserSlash } from "react-icons/fa";
import { PiUserSwitchLight } from "react-icons/pi";

export default function AceitaramJesus() {
  const API = import.meta.env.VITE_API_URL;

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // ✅ MÁSCARA DE TELEFONE
  const formatTelefone = (value) => {
    value = value.replace(/\D/g, "");

    value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
    value = value.replace(/(\d{5})(\d)/, "$1-$2");

    return value;
  };

  // BUSCAR TOTAL NO BANCO
  const fetchDados = async () => {
    try {
      const res = await fetch(`${API}/api/aceitaram-jesus`);

      if (!res.ok) throw new Error("Erro ao buscar dados");

      const data = await res.json();
      setTotal(Array.isArray(data) ? data.length : 0);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      setTotal(0);
    }
  };

  useEffect(() => {
    fetchDados();

    const handleUpdate = () => fetchDados();
    window.addEventListener("aceitaram-jesus-updated", handleUpdate);

    return () => {
      window.removeEventListener("aceitaram-jesus-updated", handleUpdate);
    };
  }, []);

  // CADASTRAR NO BANCO
  const handleCadastrar = async () => {
    if (!nome.trim()) {
      alert("Preencha os campos obrigatórios!");
      return;
    }

    const novo = {
      nome,
      telefone: telefone.replace(/\D/g, ""), // ✅ salva só números
      endereco,
      observacoes,
      data: new Date().toISOString().split("T")[0],
    };

    try {
      setLoading(true);

      const res = await fetch(`${API}/api/aceitaram-jesus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novo),
      });

      if (!res.ok) throw new Error("Erro ao salvar no banco");

      await fetchDados();
      window.dispatchEvent(new Event("aceitaram-jesus-updated"));

      setNome("");
      setTelefone("");
      setEndereco("");
      setObservacoes("");

      alert("Cadastro realizado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="container">
        <div className="grid">
          {/* FORMULÁRIO */}
          <div className="card">
            <h2>
              <PiUserSwitchLight color="#e02020" /> Cadastro de quem aceitou Jesus
            </h2>

            <label>Nome *</label>
            <input
              type="text"
              placeholder="Ex: Daniel"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />

            <label>Telefone</label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(formatTelefone(e.target.value))}
              maxLength={15}
            />

            <label>Endereço</label>
            <input
              type="text"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />

            <label>Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />

            <button
              className="btn-cadastrar"
              onClick={handleCadastrar}
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>

          {/* LADO DIREITO */}
          <div className="card">
            <h2>
              <PiUserSwitchLight color="#e02020" /> Informações
            </h2>

            <div className="alert">
              <FaUserSlash color="#e02020" />
              <div className="total-info">
                <p>Total de Registros</p>
                <h1>{total}</h1>
              </div>
            </div>

            <h3>Sobre este Cadastro</h3>
            <p>Este formulário permite registrar pessoas que aceitaram Jesus.</p>
            <p>Os dados ajudam no acompanhamento e discipulado.</p>
            <p>Todos os registros ficam disponíveis no Painel do Pastor.</p>
          </div>
        </div>
      </div>
    </>
  );
}