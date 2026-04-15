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

  const payload = JSON.stringify(membros);

  return (
    <div style={{ marginTop: "1rem" }}>
      <button className="btn-secundario" onClick={() => setAberto((v) => !v)}>
        <FaQrcode /> {aberto ? "Fechar QR Code" : "Exportar QR Code"}
      </button>

      {aberto && membros.length > 0 && (
        <div className="qr-box">
          <QRCode value={payload} size={180} />
        </div>
      )}
    </div>
  );
}

/* ================= FORM ================= */
function FormularioComLista({ tipo, membros = [], onCadastrar, onDeletar }) {
  const [form, setForm] = useState(formInicial());
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

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

    onCadastrar({ ...form, id: Date.now(), data });

    setForm(formInicial());
    setLoading(false);
  };

  return (
    <div className="two-col">
      {/* FORM */}
      <div className="card-padrao">
        <h2>{abaAtual?.icon} Cadastro de {abaAtual?.label}</h2>

        <form onSubmit={handleSubmit}>
          <input name="nome" value={form.nome} onChange={handleChange} required placeholder="Nome" />
          <input name="idade" value={form.idade} onChange={handleChange} placeholder="Idade" />
          <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" />
          <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço" />

          <button disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar"}
          </button>
        </form>

        <QRCodeMembros tipo={tipo} membros={membros} />
      </div>

      {/* TABELA */}
      <div className="card-padrao">
        <h2>{abaAtual?.label} Cadastrados</h2>

        {membros.length === 0 ? (
          <p>Nenhum membro cadastrado</p>
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
                  <td>{m.idade}</td>
                  <td>{m.telefone}</td>
                  <td>{m.endereco}</td>
                  <td>{m.data}</td>
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

/* ================= GERAL ================= */
function CadastroGeral({ todos }) {
  const total = Object.values(todos).flat().length;

  return (
    <div className="card-padrao">
      <h2><FaUsers /> Cadastro Geral</h2>
      <p>Total: {total}</p>
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
          <button key={a.id} onClick={() => setAba(a.id)}>
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      <div className="membros-content">
        {aba === "geral" ? (
          <CadastroGeral todos={todos} />
        ) : (
          <FormularioComLista
            tipo={aba}
            membros={todos[aba]}
            onCadastrar={handleCadastrar}
            onDeletar={handleDeletar}
          />
        )}
      </div>
    </>
  );
}