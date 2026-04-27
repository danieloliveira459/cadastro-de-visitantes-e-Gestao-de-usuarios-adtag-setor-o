import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaChildren,
  FaPerson,
  FaPersonDress,
  FaUsers,
  FaQrcode,
  FaDownload,
  FaTrash,
  FaFilePdf,
  FaCamera,
} from "react-icons/fa6";
import { QRCode } from "react-qr-code";
import "./CadastroMembros.css";
import Header from "../components/Header";

const ABAS = [
  { id: "criancas", label: "Crianças",      singular: "Criança", Icon: FaChildren    },
  { id: "jovens",   label: "Jovens",         singular: "Jovem",   Icon: FaPerson      },
  { id: "mulheres", label: "Mulheres",       singular: "Mulher",  Icon: FaPersonDress },
  { id: "homens",   label: "Homens",         singular: "Homem",   Icon: FaPerson      },
  { id: "geral",    label: "Cadastro Geral", singular: null,      Icon: FaUsers       },
];

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cadatro-de-visitantes-e-gest-o-de-ukhv.onrender.com";

const ROTA_POR_TIPO = {
  criancas: "criancas",
  jovens:   "jovens",
  mulheres: "mulheres",
  homens:   "homens",
};

const apiUrl = (tipo) => `${BASE_URL}/api/${ROTA_POR_TIPO[tipo]}`;

/* ================= OPÇÕES DOS SELECTS ================= */
const OPCOES_SEXO = ["Masculino", "Feminino", "Outro"];

const OPCOES_ESTADO_CIVIL = [
  "Solteiro(a)",
  "Casado(a)",
  "Divorciado(a)",
  "Viúvo(a)",
  "Outro",
];

const OPCOES_GRAU_INSTRUCAO = [
  "Sem instrução",
  "Fundamental Incompleto",
  "Fundamental Completo",
  "Médio Incompleto",
  "Médio Completo",
  "Superior Incompleto",
  "Superior Completo",
  "Pós-Graduação",
  "Mestrado",
  "Doutorado",
];

/* ================= FORM INICIAL ================= */
const formInicial = () => ({
  nome:                "",
  cpf:                 "",
  dataNascimento:      "",
  sexo:                "",
  tituloEclesiastico:  "",
  estadoCivil:         "",
  grauInstrucao:       "",
  nacionalidade:       "",
  naturalidade:        "",
  telefone:            "",
  foto:                "",
  fotoMime:            "",
  fotoNome:            "",
});

/* ================= MÁSCARA DE CPF ================= */
function formatarCPF(valor) {
  return valor
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/* ================= MÁSCARA DE TELEFONE ================= */
function formatarTelefone(valor) {
  const digits = valor.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function ocultarCPF(cpf) {
  if (!cpf) return "—";
  const d = cpf.replace(/\D/g, "");
  if (d.length < 11) return "—";
  return `${d.slice(0, 3)}.***.***-${d.slice(9, 11)}`;
}

/* ================= HELPER DE DATA ================= */
function formatarData(data) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ================= LEITURA DE ARQUIVO COMO BASE64 ================= */
function lerArquivoBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

/* ================= DOWNLOAD DA FOTO ================= */
function baixarFoto(base64, nomeArquivo) {
  const a = document.createElement("a");
  a.href = base64;
  a.download = nomeArquivo || "foto.jpg";
  a.click();
}

/* ================= EXPORTAR PDF ================= */
async function exportarPDF({ titulo, colunas, linhas, nomeArquivo }) {
  const { default: jsPDF }     = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 38, 38);
  doc.text(titulo, 14, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 23);

  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.5);
  doc.line(14, 26, 283, 26);

  autoTable(doc, {
    startY: 30,
    head: [colunas],
    body: linhas,
    styles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 30, 30] },
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [254, 242, 242] },
    columnStyles: { 0: { cellWidth: 45 } },
  });

  const finalY = doc.lastAutoTable.finalY + 6;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 38, 38);
  doc.text(`Total de registros: ${linhas.length}`, 14, finalY);

  doc.save(nomeArquivo);
}

/* ================= QR CODE DOS MEMBROS DA ABA ================= */
function QRCodeMembros({ tipo, membros }) {
  const [aberto, setAberto] = useState(false);
  const abaAtual = ABAS.find((a) => a.id === tipo);

  const origin = window.location.origin;

  // ✅ USA ?qr=criancas na URL raiz — funciona sem rota nova no servidor
  const abaUrl = `${origin}/?qr=${tipo}`;

  const baixarSVG = () => {
    const svg = document.querySelector(`#qr-${tipo} svg`);
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
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
              <QRCode value={abaUrl} size={180} />
              <p style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 6 }}>
                📱 Escaneie para ver os membros de {abaAtual?.label} — sem precisar de login
              </p>
              <button className="btn-secundario" onClick={baixarSVG} style={{ marginTop: 8 }}>
                <FaDownload /> Baixar QR Code
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* =================
   CAMPOS REUTILIZÁVEIS
================= */
function SelectField({ label, name, opcoes, form, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <select name={name} value={form[name]} onChange={onChange}>
        <option value="">Selecione...</option>
        {opcoes.map((op) => (
          <option key={op} value={op}>{op}</option>
        ))}
      </select>
    </div>
  );
}

function InputField({ label, name, placeholder, type = "text", maxLength, required, form, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">{label}{required ? " *" : ""}</label>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={form[name]}
        onChange={onChange}
        maxLength={maxLength}
        required={required}
      />
    </div>
  );
}

/* ================= FORMULÁRIO + TABELA ================= */
function FormularioComLista({ tipo, membros, onCadastrar, onDeletar, loadingLista }) {
  const [form, setForm]             = useState(formInicial());
  const [loading, setLoading]       = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [msg, setMsg]               = useState({ texto: "", erro: false });
  const fotoInputRef                = useRef(null);

  const abaAtual = ABAS.find((a) => a.id === tipo);

  useEffect(() => {
    setForm(formInicial());
    setMsg({ texto: "", erro: false });
  }, [tipo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "cpf")      formatted = formatarCPF(value);
    if (name === "telefone") formatted = formatarTelefone(value);
    setForm((prev) => ({ ...prev, [name]: formatted }));
  };

  const handleFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await lerArquivoBase64(file);
    setForm((prev) => ({
      ...prev,
      foto:     base64,
      fotoMime: file.type,
      fotoNome: file.name,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ texto: "", erro: false });

    try {
      const res = await fetch(apiUrl(tipo), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const erro = await res.json().catch(() => ({}));
        throw new Error(erro.message || "Erro ao salvar no servidor.");
      }

      const salvo = await res.json();
      const dataFormatada = salvo.createdAt
        ? formatarData(salvo.createdAt)
        : formatarData(new Date());

      onCadastrar({ ...salvo, data: dataFormatada });
      setMsg({ texto: `${abaAtual.singular} cadastrado(a) com sucesso!`, erro: false });
    } catch (err) {
      setMsg({ texto: err.message, erro: true });
    }

    setForm(formInicial());
    if (fotoInputRef.current) fotoInputRef.current.value = "";
    setLoading(false);
    setTimeout(() => setMsg({ texto: "", erro: false }), 5000);
  };

  const handleExportarPDF = async () => {
    if (membros.length === 0) return;
    setLoadingPdf(true);
    await exportarPDF({
      titulo: `Lista de ${abaAtual?.label}`,
      colunas: [
        "Nome", "CPF", "Nascimento", "Sexo",
        "Título Eclesiástico", "Estado Civil", "Grau de Instrução",
        "Nacionalidade", "Naturalidade", "Telefone", "Cadastro",
      ],
      linhas: membros.map((m) => [
        m.nome,
        ocultarCPF(m.cpf),
        m.dataNascimento
          ? new Date(m.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR")
          : "—",
        m.sexo               || "—",
        m.tituloEclesiastico || "—",
        m.estadoCivil        || "—",
        m.grauInstrucao      || "—",
        m.nacionalidade      || "—",
        m.naturalidade       || "—",
        m.telefone           || "—",
        m.data               || "—",
      ]),
      nomeArquivo: `${abaAtual?.id}-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`,
    });
    setLoadingPdf(false);
  };

  const IconeAba = abaAtual?.Icon;

  return (
    <div className="two-col">
      {/* --- CARD FORMULÁRIO --- */}
      <div className="card-padrao">
        <h2 className="titulo-card">
          {IconeAba && <IconeAba />} Cadastro de {abaAtual?.label}
        </h2>

        <div className="total-box">
          <p className="total-label">Total de {abaAtual?.label}</p>
          <span className="total-number">{membros.length}</span>
        </div>

        {msg.texto && (
          <p className="msg" style={{ color: msg.erro ? "#dc2626" : undefined }}>
            {msg.texto}
          </p>
        )}

        <form onSubmit={handleSubmit} className="form-padrao">

          {/* FOTO */}
          <div className="form-group" style={{ alignItems: "center" }}>
            <label className="form-label">Foto</label>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              {form.foto ? (
                <img
                  src={form.foto}
                  alt="Preview"
                  style={{
                    width: 100, height: 100, borderRadius: "50%",
                    objectFit: "cover", border: "2px solid var(--color-primary, #dc2626)"
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 100, height: 100, borderRadius: "50%",
                    background: "var(--color-bg-secondary, #f3f4f6)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px dashed #ccc", cursor: "pointer"
                  }}
                  onClick={() => fotoInputRef.current?.click()}
                >
                  <FaCamera size={30} color="#aaa" />
                </div>
              )}

              <input
                ref={fotoInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFoto}
              />

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  type="button"
                  className="btn-secundario"
                  style={{ fontSize: 12, padding: "4px 12px" }}
                  onClick={() => fotoInputRef.current?.click()}
                >
                  {form.foto ? "Trocar foto" : "Selecionar foto"}
                </button>

                {form.foto && (
                  <>
                    <button
                      type="button"
                      className="btn-secundario"
                      style={{ fontSize: 12, padding: "4px 12px", color: "#2563eb" }}
                      onClick={() => baixarFoto(form.foto, form.fotoNome || `foto-${form.nome || "membro"}.jpg`)}
                    >
                      <FaDownload style={{ marginRight: 4 }} />
                      Baixar foto
                    </button>

                    <button
                      type="button"
                      className="btn-secundario"
                      style={{ fontSize: 12, padding: "4px 12px", color: "#dc2626" }}
                      onClick={() => {
                        setForm((prev) => ({ ...prev, foto: "", fotoMime: "", fotoNome: "" }));
                        if (fotoInputRef.current) fotoInputRef.current.value = "";
                      }}
                    >
                      Remover foto
                    </button>
                  </>
                )}
              </div>

              {form.fotoNome && (
                <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
                  {form.fotoNome}
                </span>
              )}
            </div>
          </div>

          {/* CAMPOS DO FORMULÁRIO */}
          <InputField
            label="Nome Completo"
            name="nome"
            placeholder="Digite o nome completo"
            required
            form={form}
            onChange={handleChange}
          />
          <InputField
            label="CPF"
            name="cpf"
            placeholder="000.000.000-00"
            maxLength={14}
            form={form}
            onChange={handleChange}
          />
          <InputField
            label="Data de Nascimento"
            name="dataNascimento"
            type="date"
            form={form}
            onChange={handleChange}
          />

          <SelectField
            label="Sexo"
            name="sexo"
            opcoes={OPCOES_SEXO}
            form={form}
            onChange={handleChange}
          />

          <InputField
            label="Título Eclesiástico"
            name="tituloEclesiastico"
            placeholder="Ex: Membro, Diácono, Pastor, Obreiro..."
            form={form}
            onChange={handleChange}
          />

          <SelectField
            label="Estado Civil"
            name="estadoCivil"
            opcoes={OPCOES_ESTADO_CIVIL}
            form={form}
            onChange={handleChange}
          />
          <SelectField
            label="Grau de Instrução"
            name="grauInstrucao"
            opcoes={OPCOES_GRAU_INSTRUCAO}
            form={form}
            onChange={handleChange}
          />

          <InputField
            label="Nacionalidade"
            name="nacionalidade"
            placeholder="Ex: Brasileiro(a)"
            form={form}
            onChange={handleChange}
          />
          <InputField
            label="Naturalidade"
            name="naturalidade"
            placeholder="Cidade / Estado de origem"
            form={form}
            onChange={handleChange}
          />

          <InputField
            label="Número de Telefone"
            name="telefone"
            placeholder="(00) 00000-0000"
            maxLength={16}
            form={form}
            onChange={handleChange}
          />

          <button className="btn-padrao" disabled={loading}>
            {loading ? "Salvando..." : `Cadastrar ${abaAtual?.singular}`}
          </button>
        </form>

        <QRCodeMembros tipo={tipo} membros={membros} />
      </div>

      {/* --- CARD TABELA --- */}
      <div className="card-padrao">
        <div className="list-header">
          <h2 className="titulo-card">
            {IconeAba && <IconeAba />} {abaAtual?.label} Cadastrados
          </h2>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="list-total-badge">Total: {membros.length}</span>
            <button
              className="btn-secundario"
              onClick={handleExportarPDF}
              disabled={membros.length === 0 || loadingPdf}
              title={membros.length === 0 ? "Cadastre membros para exportar" : "Exportar lista em PDF"}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <FaFilePdf />
              {loadingPdf ? "Gerando..." : "GERAR PDF"}
            </button>
          </div>
        </div>

        {loadingLista ? (
          <div className="empty-state">
            <p style={{ color: "var(--color-text-secondary)" }}>Carregando...</p>
          </div>
        ) : membros.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{IconeAba && <IconeAba />}</div>
            <p>Nenhum membro cadastrado ainda.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="geral-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>CPF</th>
                  <th>Nascimento</th>
                  <th>Sexo</th>
                  <th>Título Ecl.</th>
                  <th>Estado Civil</th>
                  <th>Instrução</th>
                  <th>Nacionalidade</th>
                  <th>Naturalidade</th>
                  <th>Telefone</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {membros.map((m) => (
                  <tr key={m._id ?? m.id}>
                    <td>
                      {m.foto ? (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <img
                            src={m.foto}
                            alt={m.nome}
                            style={{
                              width: 38, height: 38, borderRadius: "50%",
                              objectFit: "cover", border: "1px solid #ddd"
                            }}
                          />
                          <button
                            className="btn-secundario"
                            style={{ fontSize: 10, padding: "2px 6px", color: "#2563eb" }}
                            onClick={() => baixarFoto(m.foto, m.fotoNome || `foto-${m.nome}.jpg`)}
                            title="Baixar foto"
                          >
                            <FaDownload />
                          </button>
                        </div>
                      ) : (
                        <div style={{
                          width: 38, height: 38, borderRadius: "50%",
                          background: "#f3f4f6", display: "flex",
                          alignItems: "center", justifyContent: "center"
                        }}>
                          <FaCamera size={14} color="#aaa" />
                        </div>
                      )}
                    </td>
                    <td><strong>{m.nome}</strong></td>
                    <td>{ocultarCPF(m.cpf)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {m.dataNascimento
                        ? new Date(m.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td>{m.sexo               || "—"}</td>
                    <td>{m.tituloEclesiastico || "—"}</td>
                    <td>{m.estadoCivil        || "—"}</td>
                    <td>{m.grauInstrucao      || "—"}</td>
                    <td>{m.nacionalidade      || "—"}</td>
                    <td>{m.naturalidade       || "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{m.telefone || "—"}</td>
                    <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>{m.data || "—"}</td>
                    <td>
                      <button
                        className="member-delete"
                        onClick={() => onDeletar(tipo, m._id ?? m.id)}
                        title="Remover"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= CADASTRO GERAL ================= */
function CadastroGeral({ todos, loadingGeral }) {
  const abas  = ABAS.filter((a) => a.id !== "geral");
  const total = Object.values(todos).flat().length;
  const [loadingPdf, setLoadingPdf] = useState(false);

  const handleExportarGeralPDF = async () => {
    if (total === 0) return;
    setLoadingPdf(true);
    const linhas = abas.flatMap((a) =>
      (todos[a.id] ?? []).map((m) => [
        m.nome,
        a.label,
        ocultarCPF(m.cpf),
        m.dataNascimento
          ? new Date(m.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR")
          : "—",
        m.sexo               || "—",
        m.tituloEclesiastico || "—",
        m.estadoCivil        || "—",
        m.grauInstrucao      || "—",
        m.nacionalidade      || "—",
        m.naturalidade       || "—",
        m.telefone           || "—",
        m.data               || "—",
      ])
    );
    await exportarPDF({
      titulo: "Cadastro Geral de Membros",
      colunas: [
        "Nome", "Categoria", "CPF", "Nascimento", "Sexo",
        "Título Eclesiástico", "Estado Civil", "Grau de Instrução",
        "Nacionalidade", "Naturalidade", "Telefone", "Cadastro",
      ],
      linhas,
      nomeArquivo: `cadastro-geral-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`,
    });
    setLoadingPdf(false);
  };

  return (
    <>
      <div className="card-padrao" style={{ marginBottom: 24 }}>
        <h2 className="titulo-card"><FaUsers /> Resumo Geral</h2>
        <div className="resumo-grid">
          {abas.map((a) => {
            const IconeAba = a.Icon;
            return (
              <div className="resumo-item" key={a.id}>
                <span className="resumo-icon"><IconeAba /></span>
                <p className="resumo-label">{a.label}</p>
                <p className="resumo-numero">{todos[a.id]?.length ?? 0}</p>
              </div>
            );
          })}
        </div>
        <div className="total-geral-row">
          <span>Total Geral:</span>
          <strong>{total}</strong>
        </div>
      </div>

      <div className="card-padrao">
        <div className="list-header">
          <h2 className="titulo-card"><FaUsers /> Todos os Membros</h2>
          <button
            className="btn-secundario"
            onClick={handleExportarGeralPDF}
            disabled={total === 0 || loadingPdf}
            title="Exportar todos os membros em PDF"
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <FaFilePdf />
            {loadingPdf ? "Gerando..." : "GERAR PDF"}
          </button>
        </div>

        {loadingGeral ? (
          <div className="empty-state">
            <p style={{ color: "var(--color-text-secondary)" }}>Carregando membros...</p>
          </div>
        ) : total === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><FaUsers /></div>
            <p>Nenhum membro cadastrado ainda.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="geral-table">
              <thead>
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>CPF</th>
                  <th>Nascimento</th>
                  <th>Sexo</th>
                  <th>Título Ecl.</th>
                  <th>Estado Civil</th>
                  <th>Instrução</th>
                  <th>Nacionalidade</th>
                  <th>Naturalidade</th>
                  <th>Telefone</th>
                  <th>Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {abas.flatMap((a) => {
                  const IconeAba = a.Icon;
                  return (todos[a.id] ?? []).map((m) => (
                    <tr key={m._id ?? m.id}>
                      <td>
                        {m.foto ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <img
                              src={m.foto}
                              alt={m.nome}
                              style={{
                                width: 38, height: 38, borderRadius: "50%",
                                objectFit: "cover", border: "1px solid #ddd"
                              }}
                            />
                            <button
                              className="btn-secundario"
                              style={{ fontSize: 10, padding: "2px 6px", color: "#2563eb" }}
                              onClick={() => baixarFoto(m.foto, m.fotoNome || `foto-${m.nome}.jpg`)}
                              title="Baixar foto"
                            >
                              <FaDownload />
                            </button>
                          </div>
                        ) : (
                          <div style={{
                            width: 38, height: 38, borderRadius: "50%",
                            background: "#f3f4f6", display: "flex",
                            alignItems: "center", justifyContent: "center"
                          }}>
                            <FaCamera size={14} color="#aaa" />
                          </div>
                        )}
                      </td>
                      <td><strong>{m.nome}</strong></td>
                      <td><span className="badge-tipo"><IconeAba /> {a.singular}</span></td>
                      <td>{ocultarCPF(m.cpf)}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {m.dataNascimento
                          ? new Date(m.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td>{m.sexo               || "—"}</td>
                      <td>{m.tituloEclesiastico || "—"}</td>
                      <td>{m.estadoCivil        || "—"}</td>
                      <td>{m.grauInstrucao      || "—"}</td>
                      <td>{m.nacionalidade      || "—"}</td>
                      <td>{m.naturalidade       || "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>{m.telefone || "—"}</td>
                      <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>{m.data || "—"}</td>
                    </tr>
                  ));
                })}
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
  const [aba, setAba]                   = useState("criancas");
  const [loadingLista, setLoadingLista] = useState(false);
  const [loadingGeral, setLoadingGeral] = useState(false);

  const [todos, setTodos] = useState({
    criancas: [],
    jovens:   [],
    mulheres: [],
    homens:   [],
  });

  useEffect(() => {
    const params   = new URLSearchParams(window.location.search);
    const abaParam = params.get("aba");
    if (abaParam && ABAS.find((a) => a.id === abaParam)) {
      setAba(abaParam);
      localStorage.setItem("redirecionarAba", abaParam);
      window.history.replaceState({}, "", window.location.pathname);
    } else {
      const abaSalva = localStorage.getItem("redirecionarAba");
      if (abaSalva && ABAS.find((a) => a.id === abaSalva)) {
        setAba(abaSalva);
        localStorage.removeItem("redirecionarAba");
      }
    }
  }, []);

  const normalizarMembro = (m) => ({
    ...m,
    data: m.createdAt ? formatarData(m.createdAt) : m.data || "—",
  });

  const carregarMembros = useCallback(async (tipo) => {
    setLoadingLista(true);
    try {
      const res  = await fetch(apiUrl(tipo));
      if (!res.ok) throw new Error("Erro ao buscar membros.");
      const data = await res.json();
      setTodos((prev) => ({ ...prev, [tipo]: data.map(normalizarMembro) }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLista(false);
    }
  }, []);

  const carregarTodos = useCallback(async () => {
    setLoadingGeral(true);
    try {
      const tipos      = ["criancas", "jovens", "mulheres", "homens"];
      const resultados = await Promise.all(
        tipos.map((t) =>
          fetch(apiUrl(t))
            .then((r) => r.ok ? r.json() : [])
            .then((data) => data.map(normalizarMembro))
        )
      );
      setTodos({
        criancas: resultados[0],
        jovens:   resultados[1],
        mulheres: resultados[2],
        homens:   resultados[3],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingGeral(false);
    }
  }, []);

  useEffect(() => {
    if (aba === "geral") carregarTodos();
    else                 carregarMembros(aba);
  }, [aba, carregarMembros, carregarTodos]);

  const handleCadastrar = useCallback((membroSalvo) => {
    setTodos((prev) => ({
      ...prev,
      [aba]: [...(prev[aba] ?? []), membroSalvo],
    }));
  }, [aba]);

  const handleDeletar = async (tipo, id) => {
    try {
      const res = await fetch(`${apiUrl(tipo)}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar.");
      setTodos((prev) => ({
        ...prev,
        [tipo]: (prev[tipo] ?? []).filter((m) => (m._id ?? m.id) !== id),
      }));
    } catch (err) {
      console.error(err);
      alert("Não foi possível remover o membro. Tente novamente.");
    }
  };

  const renderConteudo = () => {
    if (aba === "geral")
      return <CadastroGeral todos={todos} loadingGeral={loadingGeral} />;
    return (
      <FormularioComLista
        tipo={aba}
        membros={todos[aba] ?? []}
        onCadastrar={handleCadastrar}
        onDeletar={handleDeletar}
        loadingLista={loadingLista}
      />
    );
  };

  return (
    <>
      <Header />
      <div className="membros-container">
        <div className="tabs">
          {ABAS.map((a) => {
            const IconeAba = a.Icon;
            return (
              <button
                key={a.id}
                className={aba === a.id ? "tab ativa" : "tab"}
                onClick={() => setAba(a.id)}
              >
                <IconeAba /> {a.label}
              </button>
            );
          })}
        </div>
        <div className="membros-content">
          {renderConteudo()}
        </div>
      </div>
    </>
  );
}
