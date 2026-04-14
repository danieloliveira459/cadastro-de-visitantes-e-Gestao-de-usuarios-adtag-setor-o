import { useState, useEffect } from "react";
import {
  FaChildren,
  FaPerson,
  FaPersonDress,
  FaQrcode,
  FaUsers,
  FaDownload,
} from "react-icons/fa6";
import QRCode from "react-qr-code";
import "./CadastroMembros.css";

const ABAS = [
  { id: "criancas", label: "Crianças", icon: <FaChildren /> },
  { id: "jovens", label: "Jovens", icon: <FaPerson /> },
  { id: "irmas", label: "Irmãs", icon: <FaPersonDress /> },
  { id: "varones", label: "Varões", icon: <FaPerson /> },
  { id: "geral", label: "Cadastro Geral", icon: <FaUsers /> },
  { id: "qrcode", label: "QR Code", icon: <FaQrcode /> },
];

const CAMPOS_BASE = [
  { name: "nome", label: "Nome completo *", type: "text", required: true },
  { name: "telefone", label: "Telefone", type: "tel" },
  { name: "endereco", label: "Endereço", type: "text" },
  { name: "dataNasc", label: "Data de nascimento", type: "date" },
];

const CAMPOS_EXTRA = {
  criancas: [
    { name: "responsavel", label: "Responsável *", type: "text", required: true },
  ],
};

function FormularioMembro({ categoria }) {
  const camposExtras = CAMPOS_EXTRA[categoria] || [];
  const todosCampos = [...CAMPOS_BASE, ...camposExtras];

  const gerarEstadoInicial = () =>
    todosCampos.reduce((acc, c) => {
      acc[c.name] = "";
      return acc;
    }, {});

  const [form, setForm] = useState(gerarEstadoInicial());
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(gerarEstadoInicial());
  }, [categoria]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setMembros((prev) => [...prev, { ...form, id: Date.now() }]);
      setForm(gerarEstadoInicial());
      setLoading(false);
    }, 500);
  };

  return (
    <div className="painel">

      {/* FORM */}
      <div className="card">
        <h2 className="card-title">
          {ABAS.find((a) => a.id === categoria)?.icon} Cadastro de {categoria}
        </h2>

        <form className="form" onSubmit={handleSubmit}>
          {todosCampos.map((campo) => (
            <div key={campo.name} className="form-group">
              <label>{campo.label}</label>
              <input
                type={campo.type}
                name={campo.name}
                value={form[campo.name]}
                onChange={(e) =>
                  setForm({ ...form, [campo.name]: e.target.value })
                }
              />
            </div>
          ))}

          <button className="btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar"}
          </button>
        </form>
      </div>

      {/* LISTA */}
      <div className="card">
        <h2 className="card-title">
          <FaUsers /> Membros ({membros.length})
        </h2>

        {membros.length === 0 ? (
          <p>Nenhum membro cadastrado</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {membros.map((m) => (
                <tr key={m.id}>
                  <td>{m.nome}</td>
                  <td>{m.telefone || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function AbaQRCode() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [gerado, setGerado] = useState(false);

  const url = `${window.location.origin}/login?email=${email}`;

  return (
    <div className="painel">
      <div className="card">
        <h2 className="card-title">
          <FaQrcode /> Gerar QR Code
        </h2>

        <form
          className="form"
          onSubmit={(e) => {
            e.preventDefault();
            setGerado(true);
          }}
        >
          <div className="form-group">
            <label>Nome</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <button className="btn-primary">Gerar</button>
        </form>
      </div>

      {gerado && (
        <div className="card">
          <h2 className="card-title">{nome}</h2>

          <QRCode value={url} size={180} />

          <button className="btn-primary" style={{ marginTop: 10 }}>
            <FaDownload /> Baixar
          </button>
        </div>
      )}
    </div>
  );
}

export default function CadastroMembros() {
  const [aba, setAba] = useState("criancas");

  return (
    <div className="container">
      <div className="tabs">
        {ABAS.map((a) => (
          <button
            key={a.id}
            className={aba === a.id ? "tab active" : "tab"}
            onClick={() => setAba(a.id)}
          >
            {a.icon} {a.label}
          </button>
        ))}
      </div>

      {aba === "qrcode" ? (
        <AbaQRCode />
      ) : (
        <FormularioMembro categoria={aba} />
      )}
    </div>
  );
}