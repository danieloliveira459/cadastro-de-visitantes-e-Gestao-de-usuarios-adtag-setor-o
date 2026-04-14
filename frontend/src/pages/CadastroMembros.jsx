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
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    setForm(gerarEstadoInicial());
  }, [categoria]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    setSucesso("");

    try {
      const res = await fetch(`${BASE_URL}/api/membros`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, categoria }),
      });

      if (!res.ok) throw new Error();

      setSucesso("Membro cadastrado com sucesso!");
    } catch {
      setSucesso("Salvo localmente!");
    }

    setMembros((prev) => [...prev, { ...form, id: Date.now() }]);
    setForm(gerarEstadoInicial());
    setLoading(false);
  };

  return (
    <div className="membro-layout">
      <div className="membro-form-box">
        <h2>
          {ABAS.find((a) => a.id === categoria)?.icon} Cadastrar{" "}
          {ABAS.find((a) => a.id === categoria)?.label}
        </h2>

        {erro && <p>{erro}</p>}
        {sucesso && <p>{sucesso}</p>}

        <form onSubmit={handleSubmit}>
          {todosCampos.map((campo) => (
            <div key={campo.name}>
              <label>{campo.label}</label>

              {campo.type === "select" ? (
                <select name={campo.name} value={form[campo.name]} onChange={handleChange}>
                  <option value="">Selecione</option>
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

          <button disabled={loading}>
            {loading ? "Salvando..." : "Cadastrar"}
          </button>
        </form>
      </div>

      <div className="membro-lista-box">
        <h3>Membros ({membros.length})</h3>

        <table>
          <tbody>
            {membros.map((m) => (
              <tr key={m.id}>
                <td>{m.nome}</td>
                <td>{m.telefone || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AbaQRCode() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [gerado, setGerado] = useState(false);

  const url = `${window.location.origin}/login?email=${encodeURIComponent(email)}`;

  const baixar = () => {
    const svg = document.querySelector("svg");
    const serializer = new XMLSerializer();
    const blob = new Blob([serializer.serializeToString(svg)], {
      type: "image/svg+xml",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `qrcode-${nome}.svg`;
    a.click();
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setGerado(true);
        }}
      >
        <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome" required />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <button>Gerar</button>
      </form>

      {gerado && (
        <div>
          <h3>{nome}</h3>
          <QRCode value={url} />
          <button onClick={baixar}>
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
    <div>
      {ABAS.map((a) => (
        <button key={a.id} onClick={() => setAba(a.id)}>
          {a.icon} {a.label}
        </button>
      ))}

      {aba === "qrcode" ? (
        <AbaQRCode />
      ) : (
        <FormularioMembro categoria={aba} />
      )}
    </div>
  );
}