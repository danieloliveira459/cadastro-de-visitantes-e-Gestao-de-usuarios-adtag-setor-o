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

// ✅ FIX: "Homens" → "homens" (minúsculo), singular correto "Varão"
const ABAS = [
  { id: "criancas", label: "Crianças",      singular: "Criança", icon: <FaChildren />    },
  { id: "jovens",   label: "Jovens",         singular: "Jovem",   icon: <FaPerson />      },
  { id: "irmas",    label: "Irmãs",          singular: "Irmã",    icon: <FaPersonDress /> },
  { id: "homens",   label: "Varões",         singular: "Varão",   icon: <FaPerson />      },
  { id: "geral",    label: "Cadastro Geral", singular: null,      icon: <FaUsers />       },
];

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cadatro-de-visitantes-e-gest-o-de.onrender.com";

// ✅ FIX: factory function evita mutação de estado compartilhado
const formInicial = () => ({ nome: "", idade: "", telefone: "", endereco: "" });

/* ================= QR CODE DOS MEMBROS DA ABA ================= */
function QRCodeMembros({ tipo, membros }) {
  const [aberto, setAberto] = useState(false);
  const abaAtual = ABAS.find((a) => a.id === tipo);

  const payload = JSON.stringify(
    membros.map(({ nome, idade, telefone, endereco }) => ({
      nome, idade, telefone, endereco, categoria: abaAtual?.label,
    }))
  );

  const baixar = () => {
    const svg = document.querySelector(`#qr-${tipo} svg`);
    if (!svg) return;
    const blob = new Blob(
      [new XMLSerializer().serializeToString(svg)],
      { type: "image/svg+xml" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qrcode-${tipo}.svg`;
    a.click();
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <button className="btn-secundario" onClick={() => setAberto((v) => !v)}>
        <FaQrcode /> {aberto ? "Fechar QR Code" : "Exportar QR Code"}
      </button>

      {aberto && (
        <div id={`qr-${tipo}`} className="qr-box" style={{ marginTop: "1rem" }}>
          {membros.length === 0 ? (
            <p style={{ color: "var(--color-text-secondary)", fontSize: 13 }}>
              Cadastre membros para gerar o QR Code.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 13, marginBottom: 8 }}>
                {membros.length} membro(s) de {abaAtual?.label}
              </p>
              <QRCode value={payload} size={180} />
              <button className="btn-secundario" onClick={baixar} style={{ marginTop: 8 }}>
                <FaDownload /> Baixar SVG
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= FORMULÁRIO + LISTA ================= */
function FormularioComLista({ tipo, membros, onCadastrar, onDeletar }) {
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
      // ✅ FIX: mensagem de aviso, não de sucesso, no fallback
      setMsg(`⚠️ ${abaAtual.singular} salvo(a) localmente (sem conexão com servidor).`);
    }

    onCadastrar({ ...form, id: Date.now() });
    setForm(formInicial());
    setLoading(false);
    setTimeout(() => setMsg(""), 4000);
  };

  return (
    <div className="two-col">
      {/* --- CARD FORMULÁRIO --- */}
      <div className="card-padrao">
        <h2 className="titulo-card">
          {abaAtual?.icon} Cadastro de {abaAtual?.label}
        </h2>

        <div className="total-box">
          <p className="total-label">Total de {abaAtual?.label}</p>
          <span className="total-number">{membros.length}</span>
        </div>

        {msg && <p className="msg">{msg}</p>}

        <form onSubmit={handleSubmit} className="form-padrao">
          <div className="form-group">
            <label className="form-label">Nome Completo</label>
            <input name="nome" placeholder="Digite o nome completo" value={form.nome} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label className="form-label">Idade</label>
            <input name="idade" placeholder="Digite a idade" value={form.idade} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Telefone</label>
            <input name="telefone" placeholder="(00) 00000-0000" value={form.telefone} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label className="form-label">Endereço</label>
            <input name="endereco" placeholder="Digite o endereço completo" value={form.endereco} onChange={handleChange} />
          </div>
          <button className="btn-padrao" disabled={loading}>
            {loading ? "Salvando..." : `Cadastrar ${abaAtual?.singular}`}
          </button>
        </form>

        {/* ✅ QR Code integrado em cada aba de categoria */}
        <QRCodeMembros tipo={tipo} membros={membros} />
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
              <button className="member-delete" onClick={() => onDeletar(tipo, m.id)} title="Remover">
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
  const abas = ABAS.filter((a) => a.id !== "geral");
  const total = Object.values(todos).flat().length;

  return (
    <>
      <div className="card-padrao" style={{ marginBottom: 24 }}>
        <h2 className="titulo-card"><FaUsers /> Resumo Geral</h2>
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

      <div className="card-padrao">
        <h2 className="titulo-card"><FaUsers /> Todos os Membros</h2>
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
                      <td><span className="badge-tipo">{a.icon} {a.singular}</span></td>
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

/* ================= MAIN ================= */
export default function CadastroMembros() {
  const [aba, setAba] = useState("criancas");

  // ✅ FIX: chave "homens" minúscula, consistente com ABAS
  const [todos, setTodos] = useState({
    criancas: [],
    jovens: [],
    irmas: [],
    homens: [],
  });

  const handleCadastrar = (tipo, novoMembro) => {
    setTodos((prev) => ({ ...prev, [tipo]: [...prev[tipo], novoMembro] }));
  };

  const handleDeletar = (tipo, id) => {
    setTodos((prev) => ({ ...prev, [tipo]: prev[tipo].filter((m) => m.id !== id) }));
  };

  const renderConteudo = () => {
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
        <div className="membros-content">
          {renderConteudo()}
        </div>
      </div>
    </>
  );
}