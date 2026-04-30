import { useState, useEffect, useRef } from "react";
import { FaChildren, FaPerson, FaPersonDress, FaCamera, FaDownload, FaTrash, FaCheck, FaPlus, FaVideo } from "react-icons/fa6";
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

/* ================= BLOCO DE FOTO (reutilizável) ================= */
function BlocoFoto({ foto, fotoNome, onFotoChange, onRemover, onBaixar }) {
  const arquivoRef = useRef(null);
  const cameraRef  = useRef(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 24 }}>
      {/* preview */}
      {foto ? (
        <img
          src={foto}
          alt="preview"
          style={{
            width: 100, height: 100, borderRadius: "50%", objectFit: "cover",
            border: "3px solid #dc2626", boxShadow: "0 2px 12px rgba(220,38,38,0.25)",
          }}
        />
      ) : (
        <div
          onClick={() => arquivoRef.current?.click()}
          style={{
            width: 100, height: 100, borderRadius: "50%", background: "#f3f4f6",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "2.5px dashed #d1d5db", cursor: "pointer",
          }}
        >
          <FaCamera size={28} color="#9ca3af" />
        </div>
      )}

      {/* inputs ocultos */}
      <input
        ref={arquivoRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={onFotoChange}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={onFotoChange}
      />

      {/* botões */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        <BtnOutline onClick={() => arquivoRef.current?.click()}>
          <FaCamera size={12} /> Selecionar arquivo
        </BtnOutline>
        <BtnOutline onClick={() => cameraRef.current?.click()}>
          <FaVideo size={12} /> Tirar foto
        </BtnOutline>
        {foto && (
          <>
            <BtnOutline onClick={onBaixar}>
              <FaDownload size={12} /> Baixar
            </BtnOutline>
            <BtnOutline cor="#dc2626" onClick={onRemover}>
              <FaTrash size={11} /> Remover
            </BtnOutline>
          </>
        )}
      </div>

      {fotoNome && (
        <span style={{ fontSize: 11, color: "#9ca3af" }}>{fotoNome}</span>
      )}
    </div>
  );
}

/* ================= COMPONENTE PRINCIPAL ================= */
export default function MembrosPublico({ abaInicial = "criancas" }) {
  const abaValida = ABAS.find((a) => a.id === abaInicial) ? abaInicial : "criancas";

  const [aba, setAba]           = useState(abaValida);
  const [view, setView]         = useState("lista");
  const [membros, setMembros]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso]   = useState(false);
  const [erro, setErro]         = useState("");
  const [form, setForm]         = useState(formVazio());

  useEffect(() => {
    setLoading(true);
    setMembros([]);
    fetch(`${BASE_URL}/api/${aba}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMembros)
      .catch(() => setMembros([]))
      .finally(() => setLoading(false));
  }, [aba]);

  const trocarAba = (id) => {
    setAba(id);
    setView("lista");
    setForm(formVazio());
    setErro("");
    setSucesso(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let v = value;
    if (name === "cpf")      v = formatarCPF(value);
    if (name === "telefone") v = formatarTelefone(value);
    setForm((p) => ({ ...p, [name]: v }));
  };

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await lerArquivoBase64(file);
    setForm((p) => ({ ...p, foto: base64, fotoMime: file.type, fotoNome: file.name }));
  };

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
      setTimeout(() => { setSucesso(false); setView("lista"); }, 1800);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Deseja remover este membro?")) return;
    try {
      await fetch(`${BASE_URL}/api/${aba}/${id}`, { method: "DELETE" });
      setMembros((p) => p.filter((m) => (m._id ?? m.id) !== id));
    } catch {
      alert("Erro ao remover membro.");
    }
  };

  const handleAtualizarFoto = async (id, novaFoto, fotoMime, fotoNome) => {
    try {
      const res = await fetch(`${BASE_URL}/api/${aba}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foto: novaFoto, fotoMime, fotoNome }),
      });
      if (!res.ok) throw new Error();
      setMembros((prev) =>
        prev.map((m) =>
          (m._id ?? m.id) === id ? { ...m, foto: novaFoto, fotoMime, fotoNome } : m
        )
      );
    } catch {
      alert("Erro ao salvar foto.");
    }
  };

  const abaAtual = ABAS.find((a) => a.id === aba);
  const IconeAba = abaAtual?.Icon;

  return (
    <div style={{ minHeight: "100vh", background: "#fff8f8", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
        color: "#fff", padding: "1px 15px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        boxShadow: "0 3px 12px rgba(220,38,38,0.35)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={adtagLogo} alt="Logo" style={{ width: 42, height: 42, objectFit: "contain", borderRadius: 8, background: "rgba(255,255,255,0.15)", padding: 4 }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.3 }}>Cadastro de Membros</span>
            <span style={{ fontSize: 11, opacity: 0.9 }}>ADTAG EXPANSÃO SETOR "O"</span>
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
      <div style={{ display: "flex", gap: 0, overflowX: "auto", background: "#fff" }}>
        {ABAS.map((a) => {
          const Ic = a.Icon;
          const ativa = aba === a.id;
          return (
            <button key={a.id} onClick={() => trocarAba(a.id)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "12px 18px", border: "none",
              borderBottom: ativa ? "3px solid #dc2626" : "3px solid transparent",
              cursor: "pointer", fontWeight: ativa ? 700 : 500,
              fontSize: 13, whiteSpace: "nowrap", background: "transparent",
              color: ativa ? "#dc2626" : "#9ca3af", transition: "all 0.18s",
            }}>
              <Ic size={14} /> {a.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: "16px 14px", maxWidth: 1100, margin: "0 auto" }}>

        {/* ══════════════ FORMULÁRIO ══════════════ */}
        {view === "form" && (
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)", padding: "16px 20px", display: "flex", alignItems: "center", gap: 8 }}>
              {IconeAba && <IconeAba color="#fff" size={18} />}
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>Cadastrar em {abaAtual?.label}</span>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "20px 20px 24px" }}>

              {/* ── FOTO ── */}
              <BlocoFoto
                foto={form.foto}
                fotoNome={form.fotoNome}
                onFotoChange={handleFotoChange}
                onRemover={() => setForm((p) => ({ ...p, foto: "", fotoMime: "", fotoNome: "" }))}
                onBaixar={() => baixarFoto(form.foto, form.fotoNome || `foto-${form.nome || "membro"}.jpg`)}
              />

              {/* ── CAMPOS ── */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 16px" }}>
                <Campo label="Nome Completo *" span={2}>
                  <input name="nome" value={form.nome} onChange={handleChange} placeholder="Digite o nome completo" style={inputStyle} />
                </Campo>
                <Campo label="CPF">
                  <input name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" maxLength={14} style={inputStyle} />
                </Campo>
                <Campo label="Data de Nascimento">
                  <input name="dataNascimento" type="date" value={form.dataNascimento} onChange={handleChange} style={inputStyle} />
                </Campo>
                <Campo label="Sexo">
                  <select name="sexo" value={form.sexo} onChange={handleChange} style={inputStyle}>
                    <option value="">Selecione...</option>
                    {OPCOES_SEXO.map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Campo>
                <Campo label="Título Eclesiástico">
                  <input name="tituloEclesiastico" value={form.tituloEclesiastico} onChange={handleChange} placeholder="Ex: Membro, Diácono, Pastor..." style={inputStyle} />
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
                  <input name="nacionalidade" value={form.nacionalidade} onChange={handleChange} placeholder="Ex: Brasileiro(a)" style={inputStyle} />
                </Campo>
                <Campo label="Naturalidade">
                  <input name="naturalidade" value={form.naturalidade} onChange={handleChange} placeholder="Cidade / Estado" style={inputStyle} />
                </Campo>
                <Campo label="Número de Telefone">
                  <input name="telefone" value={form.telefone} onChange={handleChange} placeholder="(00) 00000-0000" maxLength={16} style={inputStyle} />
                </Campo>
              </div>

              {erro && (
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "#fef2f2", border: "1px solid #fca5a5", color: "#dc2626", fontSize: 13 }}>
                  {erro}
                </div>
              )}
              {sucesso && (
                <div style={{ marginTop: 14, padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #86efac", color: "#16a34a", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                  <FaCheck size={13} /> Cadastrado com sucesso!
                </div>
              )}

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
          <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #fee2e2", flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#dc2626", display: "flex", alignItems: "center", gap: 8 }}>
                {IconeAba && <IconeAba size={16} />} {abaAtual?.label} Cadastrados
              </span>
              <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 20, padding: "3px 14px", fontWeight: 700, fontSize: 13 }}>
                Total: {membros.length}
              </span>
            </div>

            {loading ? (
              <div style={{ padding: 50, textAlign: "center", color: "#dc2626", fontSize: 13 }}>Carregando...</div>
            ) : membros.length === 0 ? (
              <div style={{ padding: 50, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
                <div style={{ color: "#9ca3af", fontSize: 14 }}>Nenhum membro cadastrado nesta categoria.</div>
                <button onClick={() => setView("form")} style={{ marginTop: 14, padding: "9px 20px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <FaPlus size={12} /> Cadastrar primeiro
                </button>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 900 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "2px solid #fee2e2" }}>
                      {["Foto","Nome","CPF","Nascimento","Sexo","Título Ecl.","Estado Civil","Instrução","Nacionalidade","Naturalidade","Telefone","Cadastro","Ações"].map((col) => (
                        <th key={col} style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.4, whiteSpace: "nowrap" }}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {membros.map((m, i) => {
                      const nascimento = m.dataNascimento ? new Date(m.dataNascimento + "T00:00:00").toLocaleDateString("pt-BR") : "—";
                      const cadastro   = m.createdAt ? new Date(m.createdAt).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "—";
                      return (
                        <LinhaMembroComFoto
                          key={m._id ?? m.id}
                          m={m}
                          i={i}
                          nascimento={nascimento}
                          cadastro={cadastro}
                          onDeletar={handleDeletar}
                          onAtualizarFoto={handleAtualizarFoto}
                        />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

/* ── LINHA COM FOTO EDITÁVEL ── */
function LinhaMembroComFoto({ m, i, nascimento, cadastro, onDeletar, onAtualizarFoto }) {
  const arquivoRef  = useRef(null);
  const cameraRef   = useRef(null);
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const handleFotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSalvando(true);
    setModalAberto(false);
    try {
      const base64 = await lerArquivoBase64(file);
      await onAtualizarFoto(m._id ?? m.id, base64, file.type, file.name);
    } finally {
      setSalvando(false);
      if (arquivoRef.current)  arquivoRef.current.value  = "";
      if (cameraRef.current)   cameraRef.current.value   = "";
    }
  };

  return (
    <>
      <tr style={{ background: i % 2 === 0 ? "#fff" : "#fff8f8", borderBottom: "1px solid #fee2e2" }}>

        {/* ── Foto clicável ── */}
        <td style={{ padding: "10px 12px" }}>
          <div style={{ position: "relative", width: 36, height: 36 }}>
            {/* foto ou ícone */}
            {m.foto ? (
              <img src={m.foto} alt={m.nome} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #dc2626", display: "block" }} />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FaCamera size={14} color="#dc2626" />
              </div>
            )}

            {/* overlay — abre modal */}
            <div
              onClick={() => !salvando && setModalAberto(true)}
              title="Clique para trocar a foto"
              style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: salvando ? "rgba(220,38,38,0.6)" : "rgba(0,0,0,0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "background 0.2s",
              }}
              onMouseEnter={(e) => { if (!salvando) e.currentTarget.style.background = "rgba(220,38,38,0.55)"; }}
              onMouseLeave={(e) => { if (!salvando) e.currentTarget.style.background = "rgba(0,0,0,0)"; }}
            >
              {salvando
                ? <div style={{ width: 12, height: 12, border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                : <FaCamera size={13} color="#fff" style={{ opacity: 0 }} className="cam-icon" />
              }
            </div>

            {/* inputs ocultos */}
            <input ref={arquivoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFotoChange} />
            <input ref={cameraRef}  type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFotoChange} />
          </div>
        </td>

        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#111", minWidth: 140 }}>{m.nome || "—"}</td>
        <td style={{ padding: "10px 12px", color: "#6b7280", whiteSpace: "nowrap" }}>{ocultarCPF(m.cpf)}</td>
        <td style={{ padding: "10px 12px", color: "#6b7280", whiteSpace: "nowrap" }}>{nascimento}</td>
        <td style={{ padding: "10px 12px", color: "#6b7280" }}>{m.sexo || "—"}</td>
        <td style={{ padding: "10px 12px", color: "#6b7280" }}>{m.tituloEclesiastico || "—"}</td>
        <td style={{ padding: "10px 12px", color: "#6b7280" }}>{m.estadoCivil || "—"}</td>
        <td style={{ padding: "10px 12px", color: "#6b7280" }}>{m.grauInstrucao || "—"}</td>
        <td style={{ padding: "10px 12px", color: "#6b7280" }}>{m.nacionalidade || "—"}</td>
        <td style={{ padding: "10px 12px", color: "#6b7280" }}>{m.naturalidade || "—"}</td>
        <td style={{ padding: "10px 12px", color: "#6b7280", whiteSpace: "nowrap" }}>{m.telefone || "—"}</td>
        <td style={{ padding: "10px 12px", color: "#6b7280", whiteSpace: "nowrap" }}>{cadastro}</td>
        <td style={{ padding: "10px 12px" }}>
          <button
            onClick={() => onDeletar(m._id ?? m.id)}
            title="Remover membro"
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 4, borderRadius: 6, transition: "color 0.15s" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "#dc2626"}
            onMouseLeave={(e) => e.currentTarget.style.color = "#9ca3af"}
          >
            <FaTrash size={14} />
          </button>
        </td>
      </tr>

      {/* ── MODAL de escolha de foto ── */}
      {modalAberto && (
        <tr>
          <td colSpan={13} style={{ padding: 0, border: "none" }}>
            <div style={{
              position: "fixed", inset: 0, zIndex: 999,
              background: "rgba(0,0,0,0.45)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
              onClick={() => setModalAberto(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#fff", borderRadius: 14,
                  padding: "28px 32px", width: 320,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
                }}
              >
                {/* preview atual */}
                {m.foto ? (
                  <img src={m.foto} alt={m.nome} style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid #dc2626" }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FaCamera size={28} color="#dc2626" />
                  </div>
                )}

                <span style={{ fontWeight: 700, fontSize: 14, color: "#111", textAlign: "center" }}>
                  Foto de {m.nome}
                </span>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  <BtnOutline onClick={() => arquivoRef.current?.click()}>
                    <FaCamera size={12} /> Selecionar arquivo
                  </BtnOutline>
                  <BtnOutline onClick={() => cameraRef.current?.click()}>
                    <FaVideo size={12} /> Tirar foto
                  </BtnOutline>
                  {m.foto && (
                    <BtnOutline onClick={() => baixarFoto(m.foto, m.fotoNome || `foto-${m.nome}.jpg`)}>
                      <FaDownload size={12} /> Baixar foto
                    </BtnOutline>
                  )}
                </div>

                <button
                  onClick={() => setModalAberto(false)}
                  style={{ marginTop: 4, background: "none", border: "none", color: "#9ca3af", fontSize: 12, cursor: "pointer" }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

/* ── UTILITÁRIOS DE UI ── */
function Campo({ label, children, span = 1 }) {
  return (
    <div style={{ gridColumn: `span ${span}` }}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 5, letterSpacing: 0.3 }}>{label}</label>
      {children}
    </div>
  );
}

function BtnOutline({ children, onClick, cor = "#dc2626" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "7px 14px", background: "#fff",
        border: `1.5px solid ${cor}`, borderRadius: 8,
        color: cor, fontSize: 13, fontWeight: 600, cursor: "pointer",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111",
  background: "#fafafa", boxSizing: "border-box", outline: "none",
  transition: "border 0.18s", fontFamily: "inherit",
};