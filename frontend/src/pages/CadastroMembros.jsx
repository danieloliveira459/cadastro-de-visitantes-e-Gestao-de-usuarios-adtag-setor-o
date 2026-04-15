import { useState, useEffect } from "react";
import {
  FaChildren,
  FaPerson,
  FaPersonDress,
  FaQrcode,
  FaUsers,
  FaDownload,
  FaTrash,
} from "react-icons/fa6";
import QRCode from "react-qr-code";
import "./CadastroMembros.css";
import Header from "../components/Header";

const ABAS = [
  { id: "criancas", label: "Crianças",       singular: "Criança", icon: <FaChildren /> },
  { id: "jovens",   label: "Jovens",          singular: "Jovem",   icon: <FaPerson />   },
  { id: "irmas",    label: "Irmãs",           singular: "Irmã",    icon: <FaPersonDress /> },
  { id: "Homens",   label: "Homens",          singular: "Homens",   icon: <FaPerson />   },
  { id: "geral",    label: "Cadastro Geral",  singular: null,      icon: <FaUsers />    },
  { id: "qrcode",   label: "QR Code",         singular: null,      icon: <FaQrcode />   },
];

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cadatro-de-visitantes-e-gest-o-de.onrender.com";

const FORM_INICIAL = { nome: "", idade: "", telefone: "", endereco: "" };

/* ================= FORMULÁRIO + LISTA ================= */
function FormularioComLista({ tipo, membros, onCadastrar, onDeletar }) {
  const [form, setForm] = useState(FORM_INICIAL);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const abaAtual = ABAS.find((a) => a.id === tipo);

  useEffect(() => {
    setForm(FORM_INICIAL);
    setMsg("");
  }, [tipo]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${BASE_URL}/api/membros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tipo }),
      });
      if (!res.ok) throw new Error();
      setMsg(`✅ ${abaAtual.singular} cadastrado(a) com sucesso!`);
    } catch {
      setMsg(`✅ ${abaAtual.singular} salvo(a) localmente!`);
    }

    onCadastrar({ ...form, id: Date.now() });
    setForm(FORM_INICIAL);
    setLoading(false);

    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="two-col">
      {/* --- CARD FORMULÁRIO --- */}
      <div className="card-padrao">
        <h2 className="titulo-card">
          {abaAtual?.icon} Cadastro de {abaAtual?.label}
        </h2>

        {/* Total */}
        <div className="total-box">
          <p className="total-label">Total de {abaAtual?.label}</p>
          <span className="total-number">{membros.length}</span>
        </div>

        {msg && <p className="msg">{msg}</p>}

        <form onSubmit={handleSubmit} className="form-padrao">
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input
              name="nome"
              placeholder="Digite o nome completo"
              value={form.nome}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Idade</label>
            <input
              name="idade"
              placeholder="Digite a idade"
              value={form.idade}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input
              name="telefone"
              placeholder="(00) 00000-0000"
              value={form.telefone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Endereço</label>
            <input
              name="endereco"
              placeholder="Digite o endereço completo"
              value={form.endereco}
              onChange={handleChange}
            />
          </div>

          <button className="btn-padrao" disabled={loading}>
            {loading ? "Salvando..." : `Cadastrar ${abaAtual?.singular}`}
          </button>
        </form>
      </div>

      {/* --- CARD LISTA --- */}
      <div className="card-padrao">
        <div className="list-header">
          <h2 className="titulo-card">
            {abaAtual?.icon} {abaAtual?.label} Cadastrados
          </h2>
          <span className="list-total-badge">Total: {membros.length}</span>
        </div>

        {membros.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{abaAtual?.icon}</div>
            <p>Nenhum membro cadastrado ainda.</p>
          </div>
        ) : (
          membros.map((m) => (
            <div className="member-item" key={m.id}>
              <div className="member-avatar">{abaAtual?.icon}</div>
              <div className="member-info">
                <p className="member-name">{m.nome}</p>
                <p className="member-details">
                  {m.idade && `🎂 ${m.idade} anos`}
                  {m.telefone && `  📞 ${m.telefone}`}
                  {m.endereco && <><br />📍 {m.endereco}</>}
                </p>
              </div>
              <button
                className="member-delete"
                onClick={() => onDeletar(tipo, m.id)}
                title="Remover"
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ================= CADASTRO GERAL ================= */
function CadastroGeral({ todos }) {
  const abas = ABAS.filter((a) => !["geral", "qrcode"].includes(a.id));
  const total = Object.values(todos).flat().length;

  return (
    <>
      {/* Cards de resumo */}
      <div className="card-padrao" style={{ marginBottom: 24 }}>
        <h2 className="titulo-card">
          <FaUsers /> Resumo Geral
        </h2>
        <div className="resumo-grid">
          {abas.map((a) => (
            <div className="resumo-item" key={a.id}>
              <span className="resumo-icon">{a.icon}</span>
              <p className="resumo-label">{a.label}</p>
              <p className="resumo-numero">{todos[a.id]?.length ?? 0}</p>
            </div>
          ))}
        </div>
        <div className="total-geral-row">
          <span>Total Geral:</span>
          <strong>{total}</strong>
        </div>
      </div>

      {/* Tabela completa */}
      <div className="card-padrao">
        <h2 className="titulo-card">
          <FaUsers /> Todos os Membros
        </h2>

        {total === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FaUsers /></div>
            <p>Nenhum membro cadastrado ainda.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="geral-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Idade</th>
                  <th>Telefone</th>
                  <th>Endereço</th>
                </tr>
              </thead>
              <tbody>
                {abas.flatMap((a) =>
                  (todos[a.id] ?? []).map((m) => (
                    <tr key={m.id}>
                      <td><strong>{m.nome}</strong></td>
                      <td>
                        <span className="badge-tipo">
                          {a.icon} {a.singular}
                        </span>
                      </td>
                      <td>{m.idade || "—"}</td>
                      <td>{m.telefone || "—"}</td>
                      <td>{m.endereco || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

/* ================= QR CODE ================= */
function AbaQRCode() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [gerado, setGerado] = useState(false);

  const url = `${window.location.origin}/login?email=${encodeURIComponent(email)}`;

  const baixar = () => {
    const svg = document.querySelector(".qr-box svg");
    if (!svg) return;
    const blob = new Blob(
      [new XMLSerializer().serializeToString(svg)],
      { type: "image/svg+xml" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qrcode-${nome}.svg`;
    a.click();
  };

  const handleGerar = (e) => {
    e.preventDefault();
    setGerado(true);
  };

  return (
    <div className="qr-wrapper">
      <div className="card-padrao">
        <h2 className="titulo-card">
          <FaQrcode /> Gerar QR Code
        </h2>

        <form className="form-padrao" onSubmit={handleGerar}>
          <div className="form-group">
            <label className="form-label">Nome do Membro</label>
            <input
              placeholder="Nome do membro"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              placeholder="email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="btn-padrao">Gerar QR Code</button>
        </form>

        {gerado && (
          <div className="qr-box">
            <h3>{nome}</h3>
            <QRCode value={url} size={180} />
            <button className="btn-secundario" onClick={baixar}>
              <FaDownload /> Baixar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= MAIN ================= */
export default function CadastroMembros() {
  const [aba, setAba] = useState("criancas");

  // Estado centralizado de membros por categoria
  const [todos, setTodos] = useState({
    criancas: [],
    jovens: [],
    irmas: [],
    Homens: [],
  });

  const handleCadastrar = (tipo, novoMembro) => {
    setTodos((prev) => ({
      ...prev,
      [tipo]: [...prev[tipo], novoMembro],
    }));
  };

  const handleDeletar = (tipo, id) => {
    setTodos((prev) => ({
      ...prev,
      [tipo]: prev[tipo].filter((m) => m.id !== id),
    }));
  };

  const renderConteudo = () => {
    if (aba === "qrcode") return <AbaQRCode />;
    if (aba === "geral") return <CadastroGeral todos={todos} />;
    return (
      <FormularioComLista
        tipo={aba}
        membros={todos[aba]}
        onCadastrar={(m) => handleCadastrar(aba, m)}
        onDeletar={handleDeletar}
      />
    );
  };

  return (
    <>
      <Header />

      <div className="membros-container">
        {/* TABS */}
        <div className="tabs">
          {ABAS.map((a) => (
            <button
              key={a.id}
              className={aba === a.id ? "tab ativa" : "tab"}
              onClick={() => setAba(a.id)}
            >
              {a.icon} {a.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO */}
        <div className="membros-content">
          {renderConteudo()}
        </div>
      </div>
    </>
  );
}
