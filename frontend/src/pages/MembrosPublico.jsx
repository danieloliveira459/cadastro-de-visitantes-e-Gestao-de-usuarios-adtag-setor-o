import { useState, useEffect } from "react";
import { FaChildren, FaPerson, FaPersonDress, FaCamera } from "react-icons/fa6";

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

/* ================= ESTILOS ================= */
const th = {
  padding: "10px 14px",
  textAlign: "left",
  fontWeight: 700,
  color: "#dc2626",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const td = {
  padding: "10px 14px",
  borderBottom: "1px solid #fee2e2",
  verticalAlign: "middle",
  fontSize: 14,
};

/* ================= COMPONENTE PRINCIPAL ================= */
// ✅ Recebe abaInicial como prop — definida pelo parâmetro ?qr= da URL no App.jsx
export default function MembrosPublico({ abaInicial = "criancas" }) {
  const abaValida = ABAS.find((a) => a.id === abaInicial) ? abaInicial : "criancas";

  const [aba, setAba]         = useState(abaValida);
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Carrega membros sempre que a aba mudar
  useEffect(() => {
    setLoading(true);
    fetch(`${BASE_URL}/api/${aba}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMembros(data))
      .catch(() => setMembros([]))
      .finally(() => setLoading(false));
  }, [aba]);

  const abaAtual = ABAS.find((a) => a.id === aba);
  const IconeAba = abaAtual?.Icon;

  return (
    <div style={{ minHeight: "100vh", background: "#fff8f8", paddingBottom: 40 }}>

      {/* ── HEADER ── */}
      <div style={{
        background: "#dc2626",
        color: "#fff",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}>
        <span style={{ fontSize: 20 }}>📋</span>
        <span style={{ fontSize: 18, fontWeight: 700 }}>Lista de Membros</span>
      </div>

      {/* ── ABAS ── */}
      <div style={{
        display: "flex",
        gap: 6,
        padding: "14px 14px 0",
        overflowX: "auto",
        borderBottom: "2px solid #fee2e2",
      }}>
        {ABAS.map((a) => {
          const Icone = a.Icon;
          const ativa = aba === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setAba(a.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: "8px 8px 0 0",
                border: "none",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 14,
                whiteSpace: "nowrap",
                background: ativa ? "#dc2626" : "#fee2e2",
                color:      ativa ? "#fff"    : "#dc2626",
                transition: "all 0.2s",
              }}
            >
              <Icone /> {a.label}
            </button>
          );
        })}
      </div>

      {/* ── CONTEÚDO ── */}
      <div style={{ padding: 14 }}>
        <div style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}>

          {/* Título + total */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "1px solid #fee2e2",
            flexWrap: "wrap",
            gap: 8,
          }}>
            <span style={{
              fontWeight: 700,
              fontSize: 16,
              color: "#dc2626",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              {IconeAba && <IconeAba />} {abaAtual?.label}
            </span>
            <span style={{
              background: "#fee2e2",
              color: "#dc2626",
              borderRadius: 20,
              padding: "3px 14px",
              fontWeight: 700,
              fontSize: 14,
            }}>
              Total: {membros.length}
            </span>
          </div>

          {/* ── TABELA ── */}
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
              Carregando...
            </div>
          ) : membros.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#999" }}>
              Nenhum membro cadastrado nesta categoria.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#fee2e2" }}>
                    <th style={th}>Foto</th>
                    <th style={th}>Nome</th>
                    <th style={th}>Título Ecl.</th>
                    <th style={th}>Estado Civil</th>
                    <th style={th}>Telefone</th>
                    <th style={th}>Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {membros.map((m, i) => (
                    <tr
                      key={m._id ?? m.id}
                      style={{ background: i % 2 === 0 ? "#fff" : "#fff8f8" }}
                    >
                      <td style={td}>
                        {m.foto ? (
                          <img
                            src={m.foto}
                            alt={m.nome}
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid #dc2626",
                              display: "block",
                            }}
                          />
                        ) : (
                          <div style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            background: "#f3f4f6",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}>
                            <FaCamera size={15} color="#bbb" />
                          </div>
                        )}
                      </td>
                      <td style={{ ...td, fontWeight: 600 }}>{m.nome}</td>
                      <td style={td}>{m.tituloEclesiastico || "—"}</td>
                      <td style={td}>{m.estadoCivil        || "—"}</td>
                      <td style={{ ...td, whiteSpace: "nowrap" }}>{m.telefone || "—"}</td>
                      <td style={{ ...td, whiteSpace: "nowrap", fontSize: 12, color: "#999" }}>
                        {m.createdAt ? formatarData(m.createdAt) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
