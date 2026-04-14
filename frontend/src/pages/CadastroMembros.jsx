import { useState, useEffect } from "react";
import {
  FaChildren,
  FaPerson,
  FaPersonDress,
  FaQrcode,
  FaUsers,
  FaDownload,
  FaPrint,
} from "react-icons/fa6";
import { QRCodeSVG } from "qrcode.react";
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
    { name: "idade", label: "Idade", type: "number" },
  ],
  jovens: [{ name: "funcao", label: "Função", type: "text" }],
  irmas: [{ name: "ministerio", label: "Ministério", type: "text" }],
  varones: [{ name: "ministerio", label: "Ministério", type: "text" }],
  geral: [
    {
      name: "categoria",
      label: "Categoria",
      type: "select",
      options: ["Criança", "Jovem", "Irmã", "Varão", "Outro"],
    },
    { name: "ministerio", label: "Ministério", type: "text" },
  ],
};

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cadatro-de-visitantes-e-gest-o-de.onrender.com";

function FormularioMembro({ categoria }) {
  const camposExtras = CAMPOS_EXTRA[categoria] || [];
  const todosCampos = [...CAMPOS_BASE, ...camposExtras];

  const gerarEstadoInicial = () =>
    todosCampos.reduce((acc, c) => {
      acc[c.name] = "";
      return acc;
    }, {});

  const [form, setForm] = useState(gerarEstadoInicial());
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");
  const [membros, setMembros] = useState([]);

  useEffect(() => {
    setForm(gerarEstadoInicial());
  }, [categoria]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");
    setLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/membros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, categoria }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) {
        throw new Error(data?.erro || "Erro ao cadastrar.");
      }

      setSucesso("Membro cadastrado com sucesso!");
    } catch (err) {
      console.error(err);
      setSucesso("Salvo localmente!");
    }

    setMembros((prev) => [
      ...prev,
      { ...form, categoria, id: Date.now() },
    ]);

    setForm(gerarEstadoInicial());
    setLoading(false);
  };

  return (
    <div className="membro-layout">
      <div className="membro-form-box">
        <h2 className="membro-titulo">
          {ABAS.find((a) => a.id === categoria)?.icon} Cadastrar{" "}
          {ABAS.find((a) => a.id === categoria)?.label}
        </h2>

        {erro && <p className="msg-erro">{erro}</p>}
        {sucesso && <p className="msg-sucesso">{sucesso}</p>}

        <form onSubmit={handleSubmit} className="membro-form">
          {todosCampos.map((campo) => (
            <div key={campo.name} className="campo-grupo">
              <label>{campo.label}</label>

              {campo.type === "select" ? (
                <select name={campo.name} value={form[campo.name]} onChange={handleChange}>
                  <option value="">Selecione...</option>
                  {campo.options.map((op) => (
                    <option key={op}>{op}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={campo.type}
                  name={campo.name}
                  value={form[campo.name]}
                  onChange={handleChange}
                  required={campo.required}
                />
              )}
            </div>
          ))}

          <button type="submit" disabled={loading} className="btn-cadastrar">
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      </div>

      <div className="membro-lista-box">
        <h3>Membros cadastrados ({membros.length})</h3>

        {membros.length === 0 ? (
          <p>Nenhum membro cadastrado</p>
        ) : (
          <table className="membro-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {membros.map((m) => (
                <tr key={m.id}>
                  <td>{m.nome}</td>
                  <td>{m.telefone || "-"}</td>
                  <td>{m.dataNasc || "-"}</td>
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

  const url = `${window.location.origin}/login?email=${encodeURIComponent(email)}`;

  const handleDownload = () => {
    const svg = document.querySelector(".qr-card svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const blob = new Blob([serializer.serializeToString(svg)], {
      type: "image/svg+xml",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qrcode-${nome.replace(/\s+/g, "-").toLowerCase()}.svg`;
    a.click();
  };

  return (
    <div className="qr-layout">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setGerado(true);
        }}
      >
        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button>Gerar QR</button>
      </form>

      {gerado && (
        <div className="qr-card">
          <h3>{nome}</h3>
          <QRCodeSVG value={url} size={200} />
          <button onClick={handleDownload}>
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
    <div className="membros-container">
      <div className="tabs">
        {ABAS.map((a) => (
          <button key={a.id} onClick={() => setAba(a.id)}>
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