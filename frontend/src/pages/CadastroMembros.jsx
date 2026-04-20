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
  "https://cadatro-de-visitantes-e-gest-o-de.onrender.com";

const ROTA_POR_TIPO = {
  criancas: "criancas",
  jovens:   "jovens",
  mulheres: "mulheres",
  homens:   "homens",
};

const apiUrl = (tipo) => `${BASE_URL}/api/${ROTA_POR_TIPO[tipo]}`;

const formInicial = () => ({
  nome: "",
  cpf: "",
  naturalidade: "",
  dataNascimento: "",
  foto: "",
  cargo: "",
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

function ocultarCPF(cpf) {
  if (!cpf) return "—";
  const apenasDigitos = cpf.replace(/\D/g, "");
  if (apenasDigitos.length === 0) return "—";
  return "***.***.***-**";
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

/* ================= COMPRESSOR DE IMAGEM ================= */
function comprimirImagem(file, maxWidth = 800, qualidade = 0.7) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      const base64 = canvas.toDataURL("image/jpeg", qualidade);
      URL.revokeObjectURL(url);
      resolve(base64);
    };

    img.src = url;
  });
}

/* ================= EXPORTAR PDF ================= */
async function exportarPDF({ titulo, colunas, linhas, nomeArquivo }) {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(220, 38, 38);
  doc.text(titulo, 14, 16);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  const agora = new Date();
  doc.text(
    `Gerado em: ${agora.toLocaleDateString("pt-BR")}`,
    14,
    23
  );

  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(0.5);
  doc.line(14, 26, 283, 26);

  autoTable(doc, {
    startY: 30,
    head: [colunas],
    body: linhas,
    styles: { fontSize: 9, cellPadding: 3, textColor: [30, 30, 30] },
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [254, 242, 242] },
    columnStyles: { 0: { cellWidth: 50 } },
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

  const payload = JSON.stringify(
    membros.map(({ nome, cpf, naturalidade, dataNascimento, cargo }) => ({
      nome, cpf, naturalidade, dataNascimento, cargo, categoria: abaAtual?.label,
    }))
  );

  const baixar = () => {
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
              <QRCode value={payload} size={180} />
              <button className="btn-secundario" onClick={baixar} style={{ marginTop: 8 }}>
                <FaDownload /> Baixar QR code
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= FORMULÁRIO + TABELA ================= */
function FormularioComLista({ tipo, membros, onCadastrar, onDeletar, loadingLista }) {
  const [form, setForm] = useState(formInicial());
  const [loading, setLoading]       = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [msg, setMsg] = useState({ texto: "", erro: false });
  const fotoInputRef = useRef(null);

  const abaAtual = ABAS.find((a) => a.id === tipo);

  useEffect(() => {
    setForm(formInicial());
    setMsg({ texto: "", erro: false });
  }, [tipo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "cpf" ? formatarCPF(value) : value }));
  };

  const handleFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fotoComprimida = await comprimirImagem(file, 800, 0.7);
    setForm((prev) => ({ ...prev, foto: fotoComprimida }));
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

      // Apenas data, sem horário
      const dataFormatada = salvo.createdAt
        ? formatarData(salvo.createdAt)
        : formatarData(new Date());

      onCadastrar({ ...salvo, data: dataFormatada });
      setMsg({ texto: ` ${abaAtual.singular} cadastrado(a) com sucesso!`, erro: false });
    } catch (err) {
      setMsg({ texto: ` ${err.message}`, erro: true });
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
      colunas: ["Nome", "CPF", "Naturalidade", "Data de Nascimento", "Cargo", "Data de Cadastro"],
      linhas: membros.map((m) => [
        m.nome,
        ocultarCPF(m.cpf),
        m.naturalidade || "—",
        m.dataNascimento || "—",
        m.cargo || "—",
        m.data || "—",
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
                  style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--color-primary, #dc2626)" }}
                />
              ) : (
                <div
                  style={{ width: 90, height: 90, borderRadius: "50%", background: "var(--color-bg-secondary, #f3f4f6)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #ccc", cursor: "pointer" }}
                  onClick={() => fotoInputRef.current?.click()}
                >
                  <FaCamera size={28} color="#aaa" />
                </div>
              )}
              <input ref={fotoInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFoto} />
              <button type="button" className="btn-secundario" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => fotoInputRef.current?.click()}>
                {form.foto ? "Trocar foto" : "Selecionar foto"}
              </button>
              {form.foto && (
                <button
                  type="button"
                  className="btn-secundario"
                  style={{ fontSize: 12, padding: "4px 12px", color: "#dc2626" }}
                  onClick={() => { setForm((prev) => ({ ...prev, foto: "" })); if (fotoInputRef.current) fotoInputRef.current.value = ""; }}
                >
                  Remover foto
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Nome Completo *</label>
            <input name="nome" placeholder="Digite o nome completo" value={form.nome} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label">CPF</label>
            <input name="cpf" placeholder="000.000.000-00" value={form.cpf} onChange={handleChange} maxLength={14} />
          </div>

          <div className="form-group">
            <label className="form-label">Naturalidade</label>
            <input name="naturalidade" placeholder="Cidade / Estado de origem" value={form.naturalidade} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Data de Nascimento</label>
            <input name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Cargo</label>
            <input name="cargo" placeholder="Ex: Diácono, Líder, Pastor..." value={form.cargo} onChange={handleChange} />
          </div>

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
                  <th>Naturalidade</th>
                  <th>Nascimento</th>
                  <th>Cargo</th>
                  <th>Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {membros.map((m) => (
                  <tr key={m._id ?? m.id}>
                    <td>
                      {m.foto ? (
                        <img src={m.foto} alt={m.nome} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1px solid #ddd" }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FaCamera size={14} color="#aaa" />
                        </div>
                      )}
                    </td>
                    <td><strong>{m.nome}</strong></td>
                    <td>{ocultarCPF(m.cpf)}</td>
                    <td>{m.naturalidade || "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {m.dataNascimento
                        ? new Date(m.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR")
                        : "—"}
                    </td>
                    <td>{m.cargo || "—"}</td>
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
  const abas = ABAS.filter((a) => a.id !== "geral");
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
        m.naturalidade || "—",
        m.dataNascimento
          ? new Date(m.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR")
          : "—",
        m.cargo || "—",
        m.data || "—",
      ])
    );
    await exportarPDF({
      titulo: "Cadastro Geral de Membros",
      colunas: ["Nome", "Categoria", "CPF", "Naturalidade", "Data de Nascimento", "Cargo", "Data de Cadastro"],
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
                  <th>Naturalidade</th>
                  <th>Data de Nascimento</th>
                  <th>Cargo</th>
                  <th>Data de Cadastro</th>
                </tr>
              </thead>
              <tbody>
                {abas.flatMap((a) => {
                  const IconeAba = a.Icon;
                  return (todos[a.id] ?? []).map((m) => (
                    <tr key={m._id ?? m.id}>
                      <td>
                        {m.foto ? (
                          <img src={m.foto} alt={m.nome} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "1px solid #ddd" }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <FaCamera size={14} color="#aaa" />
                          </div>
                        )}
                      </td>
                      <td><strong>{m.nome}</strong></td>
                      <td><span className="badge-tipo"><IconeAba /> {a.singular}</span></td>
                      <td>{ocultarCPF(m.cpf)}</td>
                      <td>{m.naturalidade || "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        {m.dataNascimento
                          ? new Date(m.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR")
                          : "—"}
                      </td>
                      <td>{m.cargo || "—"}</td>
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
  const [aba, setAba] = useState("criancas");
  const [loadingLista, setLoadingLista] = useState(false);
  const [loadingGeral, setLoadingGeral] = useState(false);

  const [todos, setTodos] = useState({
    criancas: [],
    jovens:   [],
    mulheres: [],
    homens:   [],
  });

  const carregarMembros = useCallback(async (tipo) => {
    setLoadingLista(true);
    try {
      const res = await fetch(apiUrl(tipo));
      if (!res.ok) throw new Error("Erro ao buscar membros.");
      const data = await res.json();

      const normalizado = data.map((m) => ({
        ...m,
        data: m.createdAt
          ? formatarData(m.createdAt)
          : m.data || "—",
      }));

      setTodos((prev) => ({ ...prev, [tipo]: normalizado }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingLista(false);
    }
  }, []);

  const carregarTodos = useCallback(async () => {
    setLoadingGeral(true);
    try {
      const tipos = ["criancas", "jovens", "mulheres", "homens"];
      const resultados = await Promise.all(
        tipos.map((t) =>
          fetch(apiUrl(t))
            .then((r) => r.ok ? r.json() : [])
            .then((data) =>
              data.map((m) => ({
                ...m,
                data: m.createdAt
                  ? formatarData(m.createdAt)
                  : m.data || "—",
              }))
            )
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
    if (aba === "geral") {
      carregarTodos();
    } else {
      carregarMembros(aba);
    }
  }, [aba, carregarMembros, carregarTodos]);

  const handleCadastrar = (tipo, membroSalvo) => {
    setTodos((prev) => ({
      ...prev,
      [tipo]: [...(prev[tipo] ?? []), membroSalvo],
    }));
  };

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
        onCadastrar={(m) => handleCadastrar(aba, m)}
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
