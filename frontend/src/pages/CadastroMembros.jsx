import { useState, useEffect } from "react";
import {
  FaChildren,
  FaPerson,
  FaPersonDress,
  FaUsers,
  FaQrcode,
  FaDownload,
  FaTrash,
} from "react-icons/fa6";
import QRCode from "react-qr-code";
import "./CadastroMembros.css";
import Header from "../components/Header";

const ABAS = [
  { id: "criancas", label: "Crianças", singular: "Criança", icon: <FaChildren /> },
  { id: "jovens", label: "Jovens", singular: "Jovem", icon: <FaPerson /> },
  { id: "mulheres", label: "Mulheres", singular: "Mulher", icon: <FaPersonDress /> },
  { id: "homens", label: "Varões", singular: "Varão", icon: <FaPerson /> },
  { id: "geral", label: "Cadastro Geral", singular: null, icon: <FaUsers /> },
];

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cadatro-de-visitantes-e-gest-o-de.onrender.com";

const formInicial = () => ({
  nome: "",
  idade: "",
  telefone: "",
  endereco: "",
});

/* ================= QR CODE ================= */
function QRCodeMembros({ tipo, membros = [] }) {
  const [aberto, setAberto] = useState(false);
  const abaAtual = ABAS.find((a) => a.id === tipo);

  const payload = JSON.stringify(
    membros.map((m) => ({
      nome: m.nome,
      idade: m.idade,
      telefone: m.telefone,
      endereco: m.endereco,
    }))
  );

  return (
    <div style={{ marginTop: "1rem" }}>
      <button className="btn-secundario" onClick={() => setAberto(!aberto)}>
        <FaQrcode /> {aberto ? "Fechar QR Code" : "Exportar QR Code"}
      </button>

      {aberto && (
        <div className="qr-box" style={{ marginTop: "1rem" }}>
          {membros.length === 0 ? (
            <p>Nenhum membro para gerar QRCode</p>
          ) : (
            <>
              <QRCode value={payload} size={180} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= FORM + TABELA ================= */
function FormularioComLista({ tipo, membros = [], onCadastrar, onDeletar }) {
  const [form, setForm] = useState(formInicial());
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const abaAtual = ABAS.find((a) => a.id === tipo);

  useEffect(() => {
    setForm(formInicial());
    setMsg("");
  }, [tipo]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new Date().toLocaleString("pt-BR");

    try {
      await fetch(`${BASE_URL}/api/membros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tipo, data }),
      });

      setMsg("Salvo com sucesso!");
    } catch {
      setMsg("Salvo localmente!");
    }

    onCadastrar({ ...form, id: Date.now(), data });
    setForm(formInicial());
    setLoading(false);
  };

  return (
    <div className="two-col">
      {/* FORM */}
      <div className="card-padrao">
        <h2>{abaAtual?.label}</h2>

        <form onSubmit={handleSubmit}>
          <input name="nome" placeholder="Nome" value={form.nome} onChange={handleChange} required />
          <input name="idade" placeholder="Idade" value={form.idade} onChange={handleChange} />
          <input name="telefone" placeholder="Telefone" value={form.telefone} onChange={handleChange} />
          <input name="endereco" placeholder="Endereço" value={form.endereco} onChange={handleChange} />

          <button disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar"}
          </button>
        </form>

        {msg && <p>{msg}</p>}

        <QRCodeMembros tipo={tipo} membros={membros} />
      </div>

      {/* TABELA */}
      <div className="card-padrao">
        <h2>{abaAtual?.label} Cadastrados</h2>

        {membros.length === 0 ? (
          <p>Nenhum cadastro</p>
        ) : (
          <table className="geral-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Idade</th>
                <th>Telefone</th>
                <th>Endereço</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {membros.map((m) => (
                <tr key={m.id}>
                  <td>{m.nome}</td>
                  <td>{m.idade || "-"}</td>
                  <td>{m.telefone || "-"}</td>
                  <td>{m.endereco || "-"}</td>
                  <td>{m.data || "-"}</td>
                  <td>
                    <button onClick={() => onDeletar(tipo, m.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================= CADASTRO GERAL ================= */
function CadastroGeral({ todos }) {
  const abas = ABAS.filter((a) => a.id !== "geral");

  return (
    <div className="card-padrao">
      <h2>Todos os membros</h2>

      <table className="geral-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Idade</th>
            <th>Telefone</th>
            <th>Endereço</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          {abas.flatMap((a) =>
            (todos[a.id] || []).map((m) => (
              <tr key={m.id}>
                <td>{m.nome}</td>
                <td>{a.label}</td>
                <td>{m.idade || "-"}</td>
                <td>{m.telefone || "-"}</td>
                <td>{m.endereco || "-"}</td>
                <td>{m.data || "-"}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ================= MAIN ================= */
export default function CadastroMembros() {
  const [aba, setAba] = useState("criancas");

  const [todos, setTodos] = useState({
    criancas: [],
    jovens: [],
    mulheres: [],
    homens: [],
  });

  const handleCadastrar = (tipo, novo) => {
    setTodos((prev) => ({
      ...prev,
      [tipo]: [...prev[tipo], novo],
    }));
  };

  const handleDeletar = (tipo, id) => {
    setTodos((prev) => ({
      ...prev,
      [tipo]: prev[tipo].filter((m) => m.id !== id),
    }));
  };

  return (
    <>
      <Header />

      <div className="tabs">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={aba === a.id ? "ativa" : ""}
          >
            {a.label}
          </button>
        ))}
      </div>

      <div>
        {aba === "geral" ? (
          <CadastroGeral todos={todos} />
        ) : (
          <FormularioComLista
            tipo={aba}
            membros={todos[aba]}
            onCadastrar={(m) => handleCadastrar(aba, m)}
            onDeletar={handleDeletar}
          />
        )}
      </div>
    </>
  );
}