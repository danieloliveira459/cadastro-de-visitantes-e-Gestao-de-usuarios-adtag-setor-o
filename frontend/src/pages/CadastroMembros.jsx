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

/* ================= ABAS ================= */
const ABAS = [
  { id: "criancas", label: "Crianças", singular: "Criança", icon: <FaChildren /> },
  { id: "jovens", label: "Jovens", singular: "Jovem", icon: <FaPerson /> },
  { id: "mulheres", label: "Mulheres", singular: "Mulher", icon: <FaPersonDress /> },
  { id: "homens", label: "Varões", singular: "Varão", icon: <FaPerson /> },
  { id: "geral", label: "Cadastro Geral", singular: null, icon: <FaUsers /> },
];

const formInicial = () => ({
  nome: "",
  idade: "",
  telefone: "",
  endereco: "",
});

/* ================= QR CODE ================= */
function QRCodeMembros({ tipo, membros }) {
  const [aberto, setAberto] = useState(false);
  const abaAtual = ABAS.find((a) => a.id === tipo);

  const payload = JSON.stringify(membros);

  return (
    <div style={{ marginTop: 16 }}>
      <button className="btn-secundario" onClick={() => setAberto(!aberto)}>
        <FaQrcode /> {aberto ? "Fechar QR Code" : "Exportar QR Code"}
      </button>

      {aberto && (
        <div className="qr-box">
          {membros.length === 0 ? (
            <p>Nenhum membro para gerar QR Code</p>
          ) : (
            <>
              <p>{membros.length} membro(s) de {abaAtual?.label}</p>
              <QRCode value={payload} size={180} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= FORM + LISTA ================= */
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const novo = {
      ...form,
      id: Date.now(),
    };

    onCadastrar(novo);

    setForm(formInicial());
    setLoading(false);
    setMsg("Cadastrado com sucesso!");

    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div className="two-col">
      {/* FORM */}
      <div className="card-padrao">
        <h2 className="titulo-card">
          {abaAtual?.icon} Cadastro de {abaAtual?.label}
        </h2>

        <div className="total-box">
          <span>Total: {membros.length}</span>
        </div>

        {msg && <p className="msg">{msg}</p>}

        <form onSubmit={handleSubmit} className="form-padrao">
          <input name="nome" value={form.nome} onChange={handleChange} placeholder="Nome" required />
          <input name="idade" value={form.idade} onChange={handleChange} placeholder="Idade" />
          <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="Telefone" />
          <input name="endereco" value={form.endereco} onChange={handleChange} placeholder="Endereço" />

          <button className="btn-padrao">
            {loading ? "Salvando..." : "Cadastrar"}
          </button>
        </form>

        <QRCodeMembros tipo={tipo} membros={membros} />
      </div>

      {/* LISTA EM TABELA */}
      <div className="card-padrao">
        <div className="list-header">
          <h2 className="titulo-card">
            {abaAtual?.icon} {abaAtual?.label} Cadastradas
          </h2>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-secundario">Gerar PDF</button>
            <span>Total: {membros.length}</span>
          </div>
        </div>

        {membros.length === 0 ? (
          <p>Nenhum membro cadastrado</p>
        ) : (
          <table className="geral-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Função</th>
                <th>Telefone</th>
                <th>Igreja</th>
                <th>Aceitou</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {membros.map((m) => (
                <tr key={m.id}>
                  <td>{m.nome}</td>
                  <td>{m.funcao}</td>
                  <td>{m.telefone}</td>
                  <td>{m.igreja}</td>
                  <td>{m.aceitou ? "Sim" : "Não"}</td>
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
      <h2>Resumo Geral</h2>
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
    const membroPadrao = {
      ...novo,
      funcao: "Membro",
      igreja: "ADAG",
      aceitou: false,
      data: new Date().toLocaleDateString(),
    };

    setTodos((prev) => ({
      ...prev,
      [tipo]: [...(prev[tipo] ?? []), membroPadrao],
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
          {aba === "geral" ? (
            <CadastroGeral todos={todos} />
          ) : (
            <FormularioComLista
              tipo={aba}
              membros={todos[aba] ?? []}
              onCadastrar={(m) => handleCadastrar(aba, m)}
              onDeletar={handleDeletar}
            />
          )}
        </div>
      </div>
    </>
  );
}