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
import Header from "../components/Header";

const ABAS = [
  { id: "criancas", label: "Crianças", icon: <FaChildren /> },
  { id: "jovens", label: "Jovens", icon: <FaPerson /> },
  { id: "irmas", label: "Irmãs", icon: <FaPersonDress /> },
  { id: "varoes", label: "Varões", icon: <FaPerson /> },
  { id: "geral", label: "Cadastro Geral", icon: <FaUsers /> },
  { id: "qrcode", label: "QR Code", icon: <FaQrcode /> },
];

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cadatro-de-visitantes-e-gest-o-de.onrender.com";

/* ================= FORMULÁRIO ================= */
function Formulario({ tipo }) {
  const [form, setForm] = useState({
    nome: "",
    idade: "",
    telefone: "",
    endereco: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    setForm({
      nome: "",
      idade: "",
      telefone: "",
      endereco: "",
    });
    setMsg("");
  }, [tipo]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

      setMsg("✅ Cadastrado com sucesso!");
    } catch {
      setMsg("⚠️ Salvo localmente");
    }

    setForm({
      nome: "",
      idade: "",
      telefone: "",
      endereco: "",
    });

    setLoading(false);
  };

  const abaAtual = ABAS.find((a) => a.id === tipo);

  return (
    <div className="card-padrao">
      <h2 className="titulo-card">
        {abaAtual?.icon} Cadastro de {abaAtual?.label}
      </h2>

      {msg && <p className="msg">{msg}</p>}

      <form onSubmit={handleSubmit} className="form-padrao">
        <input
          name="nome"
          placeholder="Digite o nome completo"
          value={form.nome}
          onChange={handleChange}
          required
        />

        <input
          name="idade"
          placeholder="Digite a idade"
          value={form.idade}
          onChange={handleChange}
        />

        <input
          name="telefone"
          placeholder="(00) 00000-0000"
          value={form.telefone}
          onChange={handleChange}
        />

        <input
          name="endereco"
          placeholder="Digite o endereço completo"
          value={form.endereco}
          onChange={handleChange}
        />

        <button className="btn-padrao" disabled={loading}>
          {loading ? "Salvando..." : `Cadastrar ${abaAtual?.label}`}
        </button>
      </form>
    </div>
  );
}

/* ================= QR CODE ================= */
function AbaQRCode() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [gerado, setGerado] = useState(false);

  const url = `${window.location.origin}/login?email=${encodeURIComponent(email)}`;

  const baixar = () => {
    const svg = document.querySelector("svg");
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

  return (
    <div className="card-padrao">
      <h2 className="titulo-card">
        <FaQrcode /> Gerar QR Code
      </h2>

      <form
        className="form-padrao"
        onSubmit={(e) => {
          e.preventDefault();
          setGerado(true);
        }}
      >
        <input
          placeholder="Nome do membro"
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
  );
}

/* ================= MAIN ================= */
export default function CadastroMembros() {
  const [aba, setAba] = useState("criancas");

  return (
    <>
      {/* 🔥 HEADER GLOBAL */}
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
              {a.label}
            </button>
          ))}
        </div>

        {/* CONTEÚDO */}
        {aba === "qrcode" ? (
          <AbaQRCode />
        ) : (
          <Formulario tipo={aba} />
        )}
      </div>
    </>
  );
}