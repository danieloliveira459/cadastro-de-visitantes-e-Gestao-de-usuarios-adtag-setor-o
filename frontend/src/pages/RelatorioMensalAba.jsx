// RelatorioMensalAba.jsx
import { useState } from "react";
import { FaFilePdf } from "react-icons/fa6";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://cadatro-de-visitantes-e-gest-o-de-ukhv.onrender.com";

const MESES = [
  { v: 1,  l: "Janeiro"   }, { v: 2,  l: "Fevereiro" },
  { v: 3,  l: "Março"     }, { v: 4,  l: "Abril"     },
  { v: 5,  l: "Maio"      }, { v: 6,  l: "Junho"     },
  { v: 7,  l: "Julho"     }, { v: 8,  l: "Agosto"    },
  { v: 9,  l: "Setembro"  }, { v: 10, l: "Outubro"   },
  { v: 11, l: "Novembro"  }, { v: 12, l: "Dezembro"  },
];

function nomeMes(n) {
  return MESES.find((m) => m.v === n)?.l ?? "";
}

function formatarSemana(semana) {
  if (!semana) return "—";
  const seg = new Date(semana + "T00:00:00");
  const sab = new Date(seg);
  sab.setDate(seg.getDate() + 5);
  return `${seg.toLocaleDateString("pt-BR")} – ${sab.toLocaleDateString("pt-BR")}`;
}

export default function RelatorioMensalAba({
  tipo,
  titulo,
  colunas,
  renderLinha,
  renderLinhaPdf,
}) {
  const hoje = new Date();
  const [mes,        setMes]        = useState(hoje.getMonth() + 1);
  const [ano,        setAno]        = useState(hoje.getFullYear());
  const [dados,      setDados]      = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [erro,       setErro]       = useState("");
  const [aberto,     setAberto]     = useState(false);

  const anos = [];
  for (let a = hoje.getFullYear(); a >= hoje.getFullYear() - 4; a--) anos.push(a);

  const buscar = async () => {
    setLoading(true);
    setErro("");
    setDados(null);
    try {
      const res = await fetch(
        `${BASE_URL}/api/semanas/relatorio-mensal?mes=${mes}&ano=${ano}`
      );
      if (!res.ok) throw new Error("Erro ao buscar relatório.");
      const json = await res.json();
      setDados(json[tipo] ?? []);
      setAberto(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  };

  const gerarPDF = async () => {
    if (!dados || dados.length === 0) return;
    setGerandoPdf(true);

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const W   = doc.internal.pageSize.getWidth();

    doc.setFillColor(220, 38, 38);
    doc.rect(0, 0, W, 26, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text(
      `${titulo.toUpperCase()} — ${nomeMes(mes).toUpperCase()} ${ano}`,
      W / 2, 11, { align: "center" }
    );
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Gerado em: ${new Date().toLocaleDateString("pt-BR")}  |  Total: ${dados.length} registros`,
      W / 2, 20, { align: "center" }
    );

    const linhaPdf =
      renderLinhaPdf ??
      ((row) =>
        renderLinha(row).map((c) =>
          typeof c === "string" || typeof c === "number" ? String(c) : ""
        ));

    autoTable(doc, {
      startY: 30,
      head: [["Semana", ...colunas]],
      body: dados.map((row) => [formatarSemana(row.semana), ...linhaPdf(row)]),
      styles: { fontSize: 8, cellPadding: 2.5, textColor: [30, 30, 30] },
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [254, 242, 242] },
      margin: { left: 12, right: 12 },
    });

    const finalY = doc.lastAutoTable.finalY + 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(`Total de registros: ${dados.length}`, 12, finalY);

    doc.save(`${tipo}-${nomeMes(mes).toLowerCase()}-${ano}.pdf`);
    setGerandoPdf(false);
  };

  const selectStyle = {
    padding: "6px 10px", borderRadius: 7,
    border: "1.5px solid #e5e7eb", fontSize: 13, color: "#374151",
    background: "#fafafa", fontFamily: "inherit", cursor: "pointer",
    height: 34,
  };

  return (
    <div style={{
      marginBottom: 18,
      background: "#fff",
      borderRadius: 10,
      border: "1.5px solid #fecaca",
      boxShadow: "0 1px 6px rgba(220,38,38,0.06)",
      overflow: "hidden",
    }}>
      {/* cabeçalho compacto */}
      <div style={{
        background: "#fff5f5",
        borderBottom: "1.5px solid #fecaca",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
        flexWrap: "wrap",
      }}>
        {/* título + seletor + botão na mesma linha */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#dc2626",
            display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>
            <FaFilePdf size={13} /> Relatório Mensal — {titulo}
          </span>

          <select
            value={mes}
            onChange={(e) => { setMes(Number(e.target.value)); setDados(null); setAberto(false); }}
            style={selectStyle}
          >
            {MESES.map((m) => (
              <option key={m.v} value={m.v}>{m.l}</option>
            ))}
          </select>

          <select
            value={ano}
            onChange={(e) => { setAno(Number(e.target.value)); setDados(null); setAberto(false); }}
            style={{ ...selectStyle, width: 80 }}
          >
            {anos.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>

          <button
            onClick={buscar}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "0 14px", height: 34,
              background: "#fff", border: "1.5px solid #dc2626",
              borderRadius: 7, color: "#dc2626",
              fontWeight: 700, fontSize: 12,
              cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap", opacity: loading ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            <FaFilePdf size={11} />
            {loading ? "Buscando..." : "Gerar Mensal"}
          </button>

          {dados && dados.length > 0 && (
            <button
              onClick={gerarPDF}
              disabled={gerandoPdf}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "0 14px", height: 34,
                background: "#dc2626", border: "none",
                borderRadius: 7, color: "#fff",
                fontWeight: 700, fontSize: 12,
                cursor: gerandoPdf ? "not-allowed" : "pointer",
                whiteSpace: "nowrap", opacity: gerandoPdf ? 0.7 : 1,
                fontFamily: "inherit",
              }}
            >
              <FaFilePdf size={11} />
              {gerandoPdf ? "Gerando..." : "Baixar PDF"}
            </button>
          )}
        </div>

        {/* badge total */}
        {dados !== null && (
          <span style={{
            background: "#fee2e2", color: "#dc2626",
            borderRadius: 20, padding: "2px 12px",
            fontWeight: 700, fontSize: 12, whiteSpace: "nowrap",
          }}>
            {dados.length} registro{dados.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* erro */}
      {erro && (
        <div style={{
          margin: "8px 14px", padding: "7px 12px",
          background: "#fef2f2", border: "1px solid #fca5a5",
          borderRadius: 7, color: "#dc2626", fontSize: 12,
        }}>
          {erro}
        </div>
      )}

      {/* tabela de resultados */}
      {aberto && dados !== null && !loading && (
        <div style={{ padding: "0 0 10px" }}>
          {dados.length === 0 ? (
            <div style={{
              padding: "16px 0", textAlign: "center",
              color: "#9ca3af", fontSize: 13,
            }}>
              Nenhum registro encontrado em {nomeMes(mes)} {ano}.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#fef2f2" }}>
                    <th style={{
                      padding: "7px 12px", textAlign: "left",
                      fontWeight: 700, color: "#9ca3af", fontSize: 10,
                      whiteSpace: "nowrap", borderBottom: "1.5px solid #fecaca",
                    }}>
                      Semana
                    </th>
                    {colunas.map((c) => (
                      <th key={c} style={{
                        padding: "7px 12px", textAlign: "left",
                        fontWeight: 700, color: "#dc2626", fontSize: 11,
                        whiteSpace: "nowrap", borderBottom: "1.5px solid #fecaca",
                      }}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dados.map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fff8f8" }}>
                      <td style={{
                        padding: "7px 12px", borderBottom: "1px solid #fef2f2",
                        color: "#9ca3af", fontSize: 10, whiteSpace: "nowrap",
                      }}>
                        {formatarSemana(row.semana)}
                      </td>
                      {renderLinha(row).map((cell, j) => (
                        <td key={j} style={{
                          padding: "7px 12px", borderBottom: "1px solid #fef2f2",
                          color: "#374151", verticalAlign: "middle", fontSize: 12,
                        }}>
                          {cell ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
