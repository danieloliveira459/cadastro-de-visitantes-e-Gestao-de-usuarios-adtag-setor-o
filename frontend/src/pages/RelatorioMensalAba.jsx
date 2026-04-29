// RelatorioMensalAba.jsx
// Componente reutilizável de relatório mensal por aba
// Uso: <RelatorioMensalAba tipo="visitantes" colunas={[...]} renderLinha={fn} renderLinhaPdf={fn} titulo="..." />

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
  tipo,            // chave da resposta da API: "visitantes" | "aceitaramJesus" | "criancas" | etc.
  titulo,          // ex: "Visitantes"
  colunas,         // array de strings com cabeçalhos
  renderLinha,     // fn(row) => array de células (pode ter JSX)
  renderLinhaPdf,  // fn(row) => array de strings puras para o PDF (opcional)
}) {
  const hoje = new Date();
  const [mes,         setMes]         = useState(hoje.getMonth() + 1);
  const [ano,         setAno]         = useState(hoje.getFullYear());
  const [dados,       setDados]       = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [gerandoPdf,  setGerandoPdf]  = useState(false);
  const [erro,        setErro]        = useState("");

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

  /* ─── ESTILOS ─── */
  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "#6b7280", marginBottom: 5,
  };
  const selectStyle = {
    width: "100%", padding: "8px 12px", borderRadius: 8,
    border: "1.5px solid #e5e7eb", fontSize: 14, color: "#374151",
    background: "#fafafa", boxSizing: "border-box",
    height: 38, fontFamily: "inherit", cursor: "pointer",
  };

  /* ─── RENDER ─── */
  return (
    <div style={{
      marginTop: 28,
      background: "#fff",
      borderRadius: 12,
      border: "1.5px solid #fecaca",
      boxShadow: "0 2px 10px rgba(220,38,38,0.07)",
      overflow: "hidden",
    }}>
      {/* cabeçalho do card */}
      <div style={{
        background: "#fff5f5",
        borderBottom: "1.5px solid #fecaca",
        padding: "12px 18px",
        display: "flex", alignItems: "center", gap: 8,
        fontWeight: 700, fontSize: 15, color: "#dc2626",
      }}>
        <FaFilePdf size={15} />
        Relatório Mensal — {titulo}
      </div>

      {/* controles */}
      <div style={{ padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "wrap" }}>

          {/* Mês */}
          <div style={{ flex: "1 1 150px" }}>
            <label style={labelStyle}>Mês</label>
            <select
              value={mes}
              onChange={(e) => { setMes(Number(e.target.value)); setDados(null); }}
              style={selectStyle}
            >
              {MESES.map((m) => (
                <option key={m.v} value={m.v}>{m.l}</option>
              ))}
            </select>
          </div>

          {/* Ano */}
          <div style={{ flex: "0 0 100px" }}>
            <label style={labelStyle}>Ano</label>
            <select
              value={ano}
              onChange={(e) => { setAno(Number(e.target.value)); setDados(null); }}
              style={selectStyle}
            >
              {anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Botão gerar mensal */}
          <button
            onClick={buscar}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "0 20px", height: 38,
              background: "#fff",
              border: "1.5px solid #dc2626",
              borderRadius: 8,
              color: "#dc2626",
              fontWeight: 700, fontSize: 13,
              cursor: loading ? "not-allowed" : "pointer",
              whiteSpace: "nowrap",
              opacity: loading ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            <FaFilePdf size={13} />
            {loading ? "Buscando..." : "Gerar Mensal"}
          </button>

          {/* Botão baixar PDF — só aparece com dados */}
          {dados && dados.length > 0 && (
            <button
              onClick={gerarPDF}
              disabled={gerandoPdf}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "0 20px", height: 38,
                background: "#dc2626",
                border: "none",
                borderRadius: 8,
                color: "#fff",
                fontWeight: 700, fontSize: 13,
                cursor: gerandoPdf ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                opacity: gerandoPdf ? 0.7 : 1,
                fontFamily: "inherit",
              }}
            >
              <FaFilePdf size={13} />
              {gerandoPdf ? "Gerando..." : "Baixar PDF"}
            </button>
          )}
        </div>

        {/* erro */}
        {erro && (
          <div style={{
            marginTop: 10, padding: "8px 12px",
            background: "#fef2f2", border: "1px solid #fca5a5",
            borderRadius: 8, color: "#dc2626", fontSize: 13,
          }}>
            {erro}
          </div>
        )}

        {/* resultado */}
        {dados !== null && !loading && (
          <div style={{ marginTop: 16 }}>
            <div style={{
              display: "flex", alignItems: "center",
              justifyContent: "space-between", marginBottom: 10,
            }}>
              <span style={{ fontWeight: 700, color: "#374151", fontSize: 14 }}>
                {nomeMes(mes)} {ano}
              </span>
              <span style={{
                background: "#fee2e2", color: "#dc2626",
                borderRadius: 20, padding: "3px 14px",
                fontWeight: 700, fontSize: 13,
              }}>
                {dados.length} registro{dados.length !== 1 ? "s" : ""}
              </span>
            </div>

            {dados.length === 0 ? (
              <div style={{
                padding: "28px 0", textAlign: "center",
                color: "#9ca3af", fontSize: 14,
              }}>
                Nenhum registro encontrado em {nomeMes(mes)} {ano}.
              </div>
            ) : (
              <div style={{ overflowX: "auto", borderRadius: 8, border: "1px solid #fee2e2" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#fef2f2" }}>
                      <th style={{
                        padding: "9px 12px", textAlign: "left",
                        fontWeight: 700, color: "#9ca3af", fontSize: 11,
                        whiteSpace: "nowrap", borderBottom: "1.5px solid #fecaca",
                      }}>
                        Semana
                      </th>
                      {colunas.map((c) => (
                        <th key={c} style={{
                          padding: "9px 12px", textAlign: "left",
                          fontWeight: 700, color: "#dc2626", fontSize: 12,
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
                          padding: "9px 12px", borderBottom: "1px solid #fef2f2",
                          color: "#9ca3af", fontSize: 11, whiteSpace: "nowrap",
                        }}>
                          {formatarSemana(row.semana)}
                        </td>
                        {renderLinha(row).map((cell, j) => (
                          <td key={j} style={{
                            padding: "9px 12px", borderBottom: "1px solid #fef2f2",
                            color: "#374151", verticalAlign: "middle",
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
    </div>
  );
}
