import { useState, useEffect, useRef } from "react";
import { FaChildren, FaPerson, FaPersonDress, FaCamera, FaDownload, FaTrash, FaCheck, FaPlus, FaUsers } from "react-icons/fa6";
import adtagLogo from "../assets/adtag.png";

/* ================= ABAS ================= */
const ABAS = [
  { id: "criancas", label: "Crianças",  Icon: FaChildren    },
  { id: "jovens",   label: "Jovens",    Icon: FaPerson      },
  { id: "mulheres", label: "Mulheres",  Icon: FaPersonDress },
  { id: "homens",   label: "Homens",    Icon: FaPerson      },
];

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cadatro-de-visitantes-e-gest-o-de-ukhv.onrender.com";

/* ================= OPÇÕES ================= */
const OPCOES_SEXO           = ["Masculino", "Feminino", "Outro"];
const OPCOES_ESTADO_CIVIL   = ["Solteiro(a)", "Casado(a)", "Divorciado(a)", "Viúvo(a)", "Outro"];
const OPCOES_GRAU_INSTRUCAO = [
  "Sem instrução", "Fundamental Incompleto", "Fundamental Completo",
  "Médio Incompleto", "Médio Completo", "Superior Incompleto",
  "Superior Completo", "Pós-Graduação", "Mestrado", "Doutorado",
];

/* ================= HELPERS ================= */
function formatarCPF(v) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatarTelefone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
}

function ocultarCPF(cpf) {
  if (!cpf) return "—";
  const d = cpf.replace(/\D/g, "");
  if (d.length < 11) return "—";
  return `${d.slice(0, 3)}.***.***-${d.slice(9, 11)}`;
}

function formatarData(data) {
  if (!data) return "—";
  return new Date(data).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit", month: "2-digit", year: "numeric",
  });
}

function lerArquivoBase64(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.readAsDataURL(file);
  });
}

function baixarFoto(base64, nome) {
  const a = document.createElement("a");
  a.href = base64;
  a.download = nome || "foto.jpg";
  a.click();
}

const formVazio = () => ({
  nome: "", cpf: "", dataNascimento: "", sexo: "",
  tituloEclesiastico: "", estadoCivil: "", grauInstrucao: "",
  nacionalidade: "", naturalidade: "", telefone: "",
  foto: "", fotoMime: "", fotoNome: "",
});

/* ================= COMPONENTE PRINCIPAL ================= */
export default function MembrosPublico({ abaInicial = "criancas" }) {
  const abaValida = ABAS.find((a) => a.id === abaInicial) ? abaInicial : "criancas";

  const [aba, setAba]           = useState(abaValida);
  const [view, setView]         = useState("lista");   // "lista" | "form"
  const [membros, setMembros]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso]   = useState(false);
  const [erro, setErro]         = useState("");
  const [form, setForm]         = useState(formVazio());
  const fotoRef                 = useRef(null);

  /* carrega membros sempre que muda a aba */
  useEffect(() => {
    setLoading(true);
    setMembros([]);
    fetch(`${BASE_URL}/api/${aba}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMembros)
      .catch(() => setMembros([]))
      .finally(() => setLoading(false));
  }, [aba]);

  /* troca aba → volta pra lista */
  const trocarAba = (id) => {
    setAba(id);
    setView("lista");
    setForm(formVazio());
    setErro("");
    setSucesso(false);
  };

  /* handle campos */
  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "cpf")      v = formatarCPF(value);
    if (name === "telefone") v = formatarTelefone(value);
    setForm((p) => ({ ...p, [name]: v }));
  };

  /* handle foto */
  const handleFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await lerArquivoBase64(file);
    setForm((p) => ({ ...p, foto: base64, fotoMime: file.type, fotoNome: file.name }));
  };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nome.trim()) { setErro("Nome é obrigatório."); return; }
    setSalvando(true);
    setErro("");

    try {
      const res = await fetch(`${BASE_URL}/api/${aba}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erro ao salvar.");
      }

      const salvo = await res.json();
      setMembros((p) => [salvo, ...p]);
      setSucesso(true);
      setForm(formVazio());
      if (fotoRef.current) fotoRef.current.value = "";
      setTimeout(() => { setSucesso(false); setView("lista"); }, 1800);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const abaAtual = ABAS.find((a) => a.id === aba);
  const IconeAba = abaAtual?.Icon;

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <div style={{ minHeight: "100vh", background: "#fff8f8", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
        color: "#fff",
        padding: "1px 15px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 3px 12px rgba(220,38,38,0.35)",
      }}>
       <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
  <img
    src={adtagLogo}
    alt="Logo"
    style={{
      width: 42,
      height: 42,
      objectFit: "contain",
      borderRadius: 8,
      background: "rgba(255,255,255,0.15)",
      padding: 4,
    }}
  />

  <div style={{ display: "flex", flexDirection: "column" }}>
    <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.3 }}>
      Cadastro de Membros
    </span>

    <span style={{ fontSize: 11, opacity: 0.9 }}>
      ADTAG EXPANSÃO SETOR "O"
    </span>
  </div>
</div>
        <button
          onClick={() => { setView(view === "form" ? "lista" : "form"); setErro(""); setSucesso(false); }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: view === "form" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.18)",
            border: "1.5px solid rgba(255,255,255,0.5)",
            color: "#fff", borderRadius: 8, padding: "7px 14px",
            cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all 0.2s",
          }}
        >
          {view === "form" ? "← Lista" : <><FaPlus size={12} /> Cadastrar</>}
        </button>
      </div>

      {/* ── ABAS ── */}
      <div style={{
        display: "flex", gap: 0, overflowX: "auto",
        borderBottom: "2.5px solid #fca5a5",
        background: "#fff",
      }}>
        {ABAS.map((a) => {
          const Ic = a.Icon;
          const ativa = aba === a.id;
          return (
            <button key={a.id} onClick={() => trocarAba(a.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 18px",
              border: "none", borderBottom: ativa ? "3px solid #dc2626" : "3px solid transparent",
              cursor: "pointer", fontWeight: ativa ? 700 : 500,
              fontSize: 13, whiteSpace: "nowrap",
              background: "transparent",
              color: ativa ? "#dc2626" : "#9ca3af",
              transition: "all 0.18s",
            }}>
              <Ic size={14} /> {a.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "16px 14px", maxWidth: 700, margin: "0 auto" }}>

        {/* ══════════════ FORMULÁRIO ══════════════ */}
        {view === "form" && (
          <div style={{
            background: "#fff", borderRadius: 14,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}>
            {/* topo do form */}
            <div style={{
              background: "linear-gradient(135deg, #dc2626, #b91c1c)",
              padding: "16px 20px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              {IconeAba && <IconeAba color="#fff" size={18} />}
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>
                Cadastrar em {abaAtual?.label}
              </span>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px 20px 24px" }}>

              {/* ── FOTO ── */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 24 }}>
                {form.foto ? (
                  <img src={form.foto} alt="preview"
                    style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover",
                      border: "3px solid #dc2626", boxShadow: "0 2px 12px rgba(220,38,38,0.25)" }} />
                ) : (
                  <div onClick={() => fotoRef.current?.click()}
                    style={{ width: 100, height: 100, borderRadius: "50%", background: "#fee2e2",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2.5px dashed #fca5a5", cursor: "pointer", transition: "all 0.2s" }}>
                    <FaCamera size={28} color="#dc2626" />
                  </div>
                )}

                <input ref={fotoRef} type="file" accept="image/*"
                  style={{ display: "none" }} onChange={handleFoto} />

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                  <BtnSecundario onClick={() => fotoRef.current?.click()}>
                    <FaCamera size={12} /> {form.foto ? "Trocar foto" : "Selecionar foto"}
                  </BtnSecundario>

                  {form.foto && (
                    <>
                      <BtnSecundario cor="#2563eb"
                        onClick={() => baixarFoto(form.foto, form.fotoNome || `foto-${form.nome || "membro"}.jpg`)}>
                        <FaDownload size={12} /> Baixar foto
                      </BtnSecundario>
                      <BtnSecundario cor="#dc2626" onClick={() => {
                        setForm((p) => ({ ...p, foto: "", fotoMime: "", fotoNome: "" }));
                        if (fotoRef.current) fotoRef.current.value = "";
                      }}>
                        <FaTrash size={11} /> Remover
                      </BtnSecundario>
                    </>
                  )}
                </div>
                {form.fotoNome && (
                  <span style={{ fontSize: 11, color: "#9ca3af" }}>{form.fotoNome}</span>
                )}
              </div>

              {/* ── CAMPOS ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>

                <Campo label="Nome Completo *" span={2}>
                  <input name="nome" value={form.nome} onChange={handleChange}
                    placeholder="Digite o nome completo" style={inputStyle} />
                </Campo>

                <Campo label="CPF">
                  <input name="cpf" value={form.cpf} onChange={handleChange}
                    placeholder="000.000.000-00" maxLength={14} style={inputStyle} />
                </Campo>

                <Campo label="Data de Nascimento">
                  <input name="dataNascimento" type="date" value={form.dataNascimento}
                    onChange={handleChange} style={inputStyle} />
                </Campo>

                <Campo label="Sexo">
                  <select name="sexo" value={form.sexo} onChange={handleChange} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {OPCOES_SEXO.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Campo>

                <Campo label="Título Eclesiástico">
                  <input name="tituloEclesiastico" value={form.tituloEclesiastico}
                    onChange={handleChange} placeholder="Ex: Membro, Diácono, Pastor..."
                    style={inputStyle} />
                </Campo>

                <Campo label="Estado Civil">
                  <select name="estadoCivil" value={form.estadoCivil} onChange={handleChange} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {OPCOES_ESTADO_CIVIL.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Campo>

                <Campo label="Grau de Instrução">
                  <select name="grauInstrucao" value={form.grauInstrucao} onChange={handleChange} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {OPCOES_GRAU_INSTRUCAO.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Campo>

                <Campo label="Nacionalidade">
                  <input name="nacionalidade" value={form.nacionalidade}
                    onChange={handleChange} placeholder="Ex: Brasileiro(a)" style={inputStyle} />
                </Campo>

                <Campo label="Naturalidade">
                  <input name="naturalidade" value={form.naturalidade}
                    onChange={handleChange} placeholder="Cidade / Estado" style={inputStyle} />
                </Campo>

                <Campo label="Número de Telefone">
                  <input name="telefone" value={form.telefone} onChange={handleChange}
                    placeholder="(00) 00000-0000" maxLength={16} style={inputStyle} />
                </Campo>

              </div>

              {/* feedback */}
              {erro && (
                <div style={{
                  marginTop: 14, padding: "10px 14px", borderRadius: 8,
                  background: "#fef2f2", border: "1px solid #fca5a5",
                  color: "#dc2626", fontSize: 13,
                }}>
                  {erro}
                </div>
              )}

              {sucesso && (
                <div style={{
                  marginTop: 14, padding: "10px 14px", borderRadius: 8,
                  background: "#f0fdf4", border: "1px solid #86efac",
                  color: "#16a34a", fontSize: 13, display: "flex", alignItems: "center", gap: 6,
                }}>
                  <FaCheck size={13} /> Cadastrado com sucesso!
                </div>
              )}

              {/* botão submit */}
              <button type="submit" disabled={salvando} style={{
                marginTop: 20, width: "100%", padding: "13px",
                background: salvando ? "#fca5a5" : "linear-gradient(135deg, #dc2626, #b91c1c)",
                color: "#fff", border: "none", borderRadius: 10,
                fontSize: 15, fontWeight: 700, cursor: salvando ? "not-allowed" : "pointer",
                boxShadow: "0 3px 12px rgba(220,38,38,0.3)", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {salvando ? "Salvando..." : <><FaCheck size={14} /> Cadastrar Membro</>}
              </button>

            </form>
          </div>
        )}

        {/* ══════════════ LISTA ══════════════ */}
        {view === "lista" && (
          <div style={{
            background: "#fff", borderRadius: 14,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}>
            {/* topo da lista */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 18px", borderBottom: "1px solid #fee2e2",
              flexWrap: "wrap", gap: 8,
            }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#dc2626",
                display: "flex", alignItems: "center", gap: 8 }}>
                {IconeAba && <IconeAba size={16} />} {abaAtual?.label}
              </span>
              <span style={{
                background: "#fee2e2", color: "#dc2626",
                borderRadius: 20, padding: "3px 14px",
                fontWeight: 700, fontSize: 13,
              }}>
                Total: {membros.length}
              </span>
            </div>

            {/* corpo */}
            {loading ? (
              <div style={{ padding: 50, textAlign: "center" }}>
                <div style={{ color: "#dc2626", fontSize: 13 }}>Carregando...</div>
              </div>
            ) : membros.length === 0 ? (
              <div style={{ padding: 50, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                <div style={{ color: "#9ca3af", fontSize: 14 }}>
                  Nenhum membro cadastrado nesta categoria.
                </div>
                <button onClick={() => setView("form")} style={{
                  marginTop: 14, padding: "9px 20px",
                  background: "#dc2626", color: "#fff", border: "none",
                  borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
                  display: "inline-flex", alignItems: "center", gap: 6,
                }}>
                  <FaPlus size={12} /> Cadastrar primeiro
                </button>
              </div>
            ) : (
              <div>
                {membros.map((m, i) => (
                  <CardMembro key={m._id ?? m.id} m={m} index={i} />
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ── CARD DE MEMBRO (lista) ── */
function CardMembro({ m, index }) {
  const [aberto, setAberto] = useState(false);

  return (
    <div style={{
      borderBottom: "1px solid #fee2e2",
      background: index % 2 === 0 ? "#fff" : "#fff8f8",
    }}>
      {/* linha resumo — clicável */}
      <div
        onClick={() => setAberto((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", cursor: "pointer",
          transition: "background 0.15s",
        }}
      >
        {/* foto */}
        {m.foto ? (
          <img src={m.foto} alt={m.nome}
            style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover",
              border: "2px solid #dc2626", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#fee2e2",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FaCamera size={16} color="#dc2626" />
          </div>
        )}

        {/* nome + cargo */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {m.nome}
          </div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>
            {m.tituloEclesiastico || "—"} · {m.estadoCivil || "—"}
          </div>
        </div>

        {/* seta */}
        <span style={{ color: "#dc2626", fontSize: 12, transition: "transform 0.2s",
          transform: aberto ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </div>

      {/* detalhes expandidos */}
      {aberto && (
        <div style={{
          padding: "0 16px 16px 72px",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "8px 16px",
        }}>
          <DetalheItem label="CPF"               value={ocultarCPF(m.cpf)} />
          <DetalheItem label="Data Nascimento"
            value={m.dataNascimento
              ? new Date(m.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR")
              : "—"} />
          <DetalheItem label="Sexo"              value={m.sexo               || "—"} />
          <DetalheItem label="Titulo Ecl."              value={m.titulo           || "—"} />
          <DetalheItem label="Estado Civil"              value={m.estadoCivil             || "—"} />
          <DetalheItem label="Grau de Instrução" value={m.grauInstrucao      || "—"} />
          <DetalheItem label="Nacionalidade"     value={m.nacionalidade      || "—"} />
          <DetalheItem label="Naturalidade"      value={m.naturalidade       || "—"} />
          <DetalheItem label="Telefone"          value={m.telefone           || "—"} />
          <DetalheItem label="Cadastro"
            value={m.createdAt ? new Date(m.createdAt).toLocaleDateString("pt-BR", {
              timeZone: "America/Sao_Paulo"
            }) : "—"} />

          {/* download da foto */}
          {m.foto && (
            <div style={{ gridColumn: "1 / -1", marginTop: 4 }}>
              <button
                onClick={() => baixarFoto(m.foto, m.fotoNome || `foto-${m.nome}.jpg`)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", background: "#eff6ff",
                  border: "1px solid #bfdbfe", borderRadius: 8,
                  color: "#2563eb", fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}
              >
                <FaDownload size={11} /> Baixar foto para sistema da igreja
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── UTILITÁRIOS DE UI ── */
function Campo({ label, children, span = 1 }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600,
        color: "#6b7280", marginBottom: 5, letterSpacing: 0.3 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function BtnSecundario({ children, onClick, cor = "#374151" }) {
  return (
    <button type="button" onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "6px 12px", background: "#f9fafb",
      border: "1px solid #e5e7eb", borderRadius: 7,
      color: cor, fontSize: 12, fontWeight: 600, cursor: "pointer",
    }}>
      {children}
    </button>
  );
}

function DetalheItem({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af",
        textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 1 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: "#111", fontWeight: 500 }}>{value}</div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1.5px solid #e5e7eb",
  fontSize: 14,
  color: "#111",
  background: "#fafafa",
  boxSizing: "border-box",
  outline: "none",
  transition: "border 0.18s",
  fontFamily: "inherit",
};