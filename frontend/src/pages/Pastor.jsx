import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaArrowLeft, FaUsers, FaTrash, FaFilePdf, FaCalendarAlt, FaUserSlash } from "react-icons/fa";
import { MdWarning } from "react-icons/md";
import { PiUserSwitchLight } from "react-icons/pi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Pastor.css";

const API = "https://cadatro-de-visitantes-e-gest-o-de.onrender.com/api";

export default function Pastor() {
  const navigate = useNavigate();

  const [visitantes, setVisitantes] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [programacoes, setProgramacoes] = useState([]);
  const [aceitaramJesus, setAceitaramJesus] = useState([]);

  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");

  const [dia, setDia] = useState("");
 const [horarioInicio, setHorarioInicio] = useState("");
 const [horarioFim, setHorarioFim]       = useState("");
  const [atividade, setAtividade] = useState("");
  const [responsavel, setResponsavel] = useState("");

  const [aba, setAba] = useState("visitantes");

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [observacoes, setObservacoes] = useState("");

  //  recarrega sempre que trocar de aba
  useEffect(() => {
    carregarTudo();
  }, [aba]);

  const carregarTudo = async () => {
    try {
      const resVisitantes = await fetch(`${API}/visitantes`);
      const visitantesData = await resVisitantes.json();
      setVisitantes(visitantesData);

      const resAvisos = await fetch(`${API}/avisos`);
      const avisosData = await resAvisos.json();
      setAvisos(avisosData);

      try {
        const resProgramacoes = await fetch(`${API}/programacoes`);
        if (resProgramacoes.ok) {
          const programacoesData = await resProgramacoes.json();
          setProgramacoes(programacoesData);
        }
      } catch {}

      try {
        const resJesus = await fetch(`${API}/aceitaram-jesus`);
        if (resJesus.ok) {
          const jesusData = await resJesus.json();
          setAceitaramJesus(jesusData);
        }
      } catch {}

    } catch (err) {
      console.log("Erro ao carregar dados:", err);
    }
  };

  // VISITANTES
  const adicionarVisitante = async () => {
    if (!nome || !telefone) return alert("Preencha os campos!");

    await fetch(`${API}/visitantes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        cargo: "Visitante",
        telefone,
        igreja: endereco,
        observacoes,
      }),
    });

    await carregarTudo();
    setNome("");
    setTelefone("");
    setEndereco("");
    setObservacoes("");
  };

  const handleDeleteVisitante = async (id) => {
    const confirmar = window.confirm("Deseja excluir este visitante?");
    if (!confirmar) return;

    try {
      await fetch(`${API}/visitantes/${id}`, { method: "DELETE" });
      await carregarTudo();
    } catch (err) {
      console.log("Erro ao deletar visitante:", err);
    }
  };

  // AVISOS
  const adicionarAviso = async () => {
    if (!titulo || !descricao) return alert("Preencha os campos!");

    await fetch(`${API}/avisos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, descricao }),
    });

    setTitulo("");
    setDescricao("");
    await carregarTudo();
  };

  const handleDeleteAviso = async (id) => {
    const confirmar = window.confirm("Deseja excluir este aviso?");
    if (!confirmar) return;

    try {
      await fetch(`${API}/avisos/${id}`, { method: "DELETE" });
      await carregarTudo();
    } catch (err) {
      console.log("Erro ao deletar aviso:", err);
    }
  };

  // PROGRAMAÇÃO
 const adicionarProgramacao = async () => {
  if (!dia || !horarioInicio || !horarioFim || !atividade) return;

  const horarioCombinado = `${horarioInicio} às ${horarioFim}`;

  try {
    await fetch(`${API}/programacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dia, horario: horarioCombinado, atividade, responsavel }),
    });

    setDia("");
    setHorarioInicio("");
    setHorarioFim("");
    setAtividade("");
    setResponsavel("");
    await carregarTudo();
  } catch (err) {
    console.log("Erro programação:", err);
  }
};

const handleDeleteProgramacao = async (id) => {
  const confirmar = window.confirm("Deseja excluir esta programação?");
  if (!confirmar) return;

  try {
    await fetch(`${API}/programacoes/${id}`, { method: "DELETE" });
    await carregarTudo();
  } catch (err) {
    console.log("Erro ao deletar programação:", err);
  }
};
  // ACEITARAM JESUS
  const adicionarAceitouJesus = async () => {
    if (!nome) return alert("Nome obrigatório!");

    try {
      const res = await fetch(`${API}/aceitaram-jesus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone, endereco, observacoes }),
      });

      if (!res.ok) throw new Error("Erro ao salvar no banco");

      setNome("");
      setTelefone("");
      setEndereco("");
      setObservacoes("");
      await carregarTudo();
    } catch (err) {
      console.log("Erro ao adicionar:", err);
      alert("Erro ao salvar. Tente novamente.");
    }
  };

  const handleDeleteAceitouJesus = async (id) => {
    const confirmar = window.confirm("Deseja excluir este registro?");
    if (!confirmar) return;

    try {
      await fetch(`${API}/aceitaram-jesus/${id}`, { method: "DELETE" });
      await carregarTudo();
    } catch (err) {
      console.log("Erro ao deletar registro:", err);
    }
  };

  // URL corrigida — removido /api duplicado
  const atualizarAceitou = async (id, valor) => {
    try {
      const booleanValue = valor === true;

      const res = await fetch(`${API}/visitantes/${id}/aceitou`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aceitouJesus: booleanValue }),
      });

      if (!res.ok) {
        const erro = await res.json();
        console.error("Erro backend:", erro);
        return;
      }

      setVisitantes((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, aceitou_jesus: booleanValue ? 1 : 0 } : v
        )
      );

    } catch (error) {
      console.error("Erro ao atualizar:", error);
    }
  };

  // PDF
  const gerarPDF = (tipo) => {
    const doc = new jsPDF();

    doc.setTextColor(220, 38, 38);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");

    const titulos = {
      visitantes: "VISITANTES",
      avisos: "AVISOS",
      programacao: "PROGRAMAÇÃO",
      "aceitaram-jesus": "ACEITARAM A JESUS",
    };

    doc.text(
      titulos[tipo] || tipo.toUpperCase(),
      doc.internal.pageSize.getWidth() / 2,
      15,
      { align: "center" }
    );

    let tabela = [];
    let head = [];

   if (tipo === "visitantes") {
  head = [["Nome", "Cargo", "Telefone", "Igreja", "Aceitou Jesus", "Data"]];
  tabela = visitantes.map((v) => [
    v.nome,
    v.cargo,
    v.telefone,
    v.igreja,
    v.aceitou_jesus == 1 ? "Sim" : "Não",  
    v.data
      ? new Date(v.data).toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-",  // ← Data depois
  ]);
}

    if (tipo === "avisos") {
      head = [["Título", "Descrição", "Data"]];
      tabela = avisos.map((a) => [a.titulo, a.descricao, a.data]);
    }

    if (tipo === "programacao") {
      head = [["Dia", "Horário", "Atividade", "Data"]];
      tabela = programacoes.map((p) => [p.dia, p.horario, p.atividade, p.data]);
    }

    if (tipo === "aceitaram-jesus") {
      head = [["Nome", "Telefone", "Endereço", "Observações", "Data"]];
      tabela = aceitaramJesus.map((v) => [v.nome, v.telefone, v.endereco, v.observacoes, v.data]);
    }

    if (tabela.length === 0) {
      alert("Sem dados para gerar PDF!");
      return;
    }

    autoTable(doc, {
      head,
      body: tabela,
      startY: 25,
      styles: { fontSize: 10, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
      columnStyles: tipo === "aceitaram-jesus"
        ? {
            0: { cellWidth: 35 },
            1: { cellWidth: 30 },
            2: { cellWidth: 45 },
            3: { cellWidth: 50 },
            4: { cellWidth: 30 },
          }
        : {},
    });

    const nomes = {
      visitantes: "visitantes",
      avisos: "avisos",
      programacao: "programacao",
      "aceitaram-jesus": "aceitaram_a_jesus",
    };

    doc.save(`${nomes[tipo] || tipo}.pdf`);
  };

  return (
    <>
      <Header />

      <div className="pastor-container">

        <div className="back" onClick={() => navigate("/")}>
          <FaArrowLeft />
          Voltar para Cadastro
        </div>

        <div className="menu">
          <button
            className={aba === "visitantes" ? "active" : ""}
            onClick={() => setAba("visitantes")}
          >
            <FaUsers color="#e02020" /> Visitantes
          </button>

          <button
            className={aba === "avisos" ? "active" : ""}
            onClick={() => setAba("avisos")}
          >
            <MdWarning color="#e02020" /> Avisos Importantes
          </button>

          <button
            className={aba === "programacao" ? "active" : ""}
            onClick={() => setAba("programacao")}
          >
            <FaCalendarAlt color="#e02020" /> Programação da Semana
          </button>

          <button
            className={aba === "aceitaramJesus" ? "active" : ""}
            onClick={() => setAba("aceitaramJesus")}
          >
            <PiUserSwitchLight color="#e02020" /> Aceitaram a Jesus
          </button>
        </div>

        {/* VISITANTES */}
        {aba === "visitantes" && (
          <div className="painel">
            <div className="card">
              <h2 className="card-title">
                <FaUsers color="#e02020" /> Estatísticas
              </h2>
              <div className="stats-box">
                <span>Total de Visitantes</span>
                <h1>{visitantes.length}</h1>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  <FaUsers color="#e02020" /> Visitantes Cadastrados
                </h2>
                <button onClick={() => gerarPDF("visitantes")} className="btn-pdf">
                  <FaFilePdf /> Gerar PDF
                </button>
              </div>

              <span>Total: {visitantes.length}</span>

              {visitantes.length === 0 ? (
                <div className="empty">
                  <FaUsers size={40} />
                  <p>Nenhum visitante cadastrado ainda.</p>
                </div>
              ) : (
                <table className="tabela">
                 <thead>
  <tr>
    <th>Nome</th>
    <th>Função/ND</th>
    <th>Telefone</th>
    <th>Igreja</th>
    <th>Aceitou jesus?</th>  
    <th>Data</th>
    <th>Ações</th>
  </tr>
</thead>
<tbody>
  {visitantes.map((v) => (
    <tr key={v.id}>
      <td>{v.nome}</td>
      <td>{v.funcao}</td>
      <td>{v.telefone}</td>
      <td>{v.igreja}</td>

      {/* Aceitou jesus? — antes da data */}
      <td>
        <div style={{ display: "flex", gap: "10px" }}>
          <label>
            <input
              type="radio"
              name={`aceitou-${v.id}`}
              checked={v.aceitou_jesus == 1}
              onChange={() => atualizarAceitou(v.id, true)}
            />
            Sim
          </label>
          <label>
            <input
              type="radio"
              name={`aceitou-${v.id}`}
              checked={v.aceitou_jesus == 0 || v.aceitou_jesus === null}
              onChange={() => atualizarAceitou(v.id, false)}
            />
            Não
          </label>
        </div>
      </td>
      <td>
        {v.data
          ? new Date(v.data).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-"}
      </td>

      <td style={{ textAlign: "center" }}>
        <FaTrash
          className="delete"
          onClick={() => handleDeleteVisitante(v.id)}
        />
      </td>
    </tr>
  ))}
</tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* AVISOS */}
        {aba === "avisos" && (
          <div className="avisos-grid">
            <div className="card">
              <h3><MdWarning color="#e02020" /> Novo Aviso</h3>

              <div className="total-box">
                <span>Total de Avisos</span>
                <h1>{avisos.length}</h1>
              </div>

              <label>Título</label>
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} />

              <label>Descrição</label>
              <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} />

              <button className="btn-red" onClick={adicionarAviso}>
                Adicionar Aviso
              </button>
            </div>

            <div className="card">
              <div className="card-header">
                <h3><MdWarning color="#e02020" /> Avisos Importantes</h3>
                <button onClick={() => gerarPDF("avisos")} className="btn-pdf">
                  <FaFilePdf /> Gerar PDF
                </button>
                <span>Total: {avisos.length}</span>
              </div>

              <table className="tabela">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Descrição</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {avisos.map((a) => (
                    <tr key={a.id}>
                      <td>{a.titulo}</td>
                      <td>{a.descricao}</td>
                      <td>
                        {a.data
                          ? new Date(a.data).toLocaleString("pt-BR", {
                              timeZone: "America/Sao_Paulo",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <FaTrash
                          className="delete"
                          onClick={() => handleDeleteAviso(a.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

       {/* PROGRAMAÇÃO */}
{aba === "programacao" && (
  <div className="avisos-grid">
    <div className="card">
      <h3><FaCalendarAlt color="#e02020" /> Novo Evento</h3>

      <label>Dia</label>
      <select value={dia} onChange={(e) => setDia(e.target.value)}>
        <option value="">Selecione</option>
        <option>Domingo</option>
        <option>Segunda-feira</option>
        <option>Terça-feira</option>
        <option>Quarta-feira</option>
        <option>Quinta-feira</option>
        <option>Sexta-feira</option>
        <option>Sábado</option>
      </select>

      <label>Horário</label>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="time"
          value={horarioInicio}
          onChange={(e) => setHorarioInicio(e.target.value)}
          style={{ flex: 1 }}
        />
        <span style={{ color: "var(--color-text-secondary)", fontSize: 13, whiteSpace: "nowrap" }}>
          às
        </span>
        <input
          type="time"
          value={horarioFim}
          onChange={(e) => setHorarioFim(e.target.value)}
          style={{ flex: 1 }}
        />
      </div>

      <label>Atividade</label>
      <input value={atividade} onChange={(e) => setAtividade(e.target.value)} />

      <button className="btn-red" onClick={adicionarProgramacao}>
        Adicionar
      </button>
    </div>

    <div className="card">
      <h3>
        <FaCalendarAlt color="#e02020" /> Programação
        <button onClick={() => gerarPDF("programacao")} className="btn-pdf">
          <FaFilePdf /> Gerar PDF
        </button>
      </h3>

      <table className="tabela">
        <thead>
          <tr>
            <th>Dia</th>
            <th>Horário</th>
            <th>Atividade</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {programacoes.map((p) => (
            <tr key={p.id}>
              <td>{p.dia}</td>
              <td style={{ whiteSpace: "nowrap" }}>{p.horario}</td>
              <td>{p.atividade}</td>
              <td>
                {p.data
                  ? new Date(p.data).toLocaleString("pt-BR", {
                      timeZone: "America/Sao_Paulo",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "-"}
              </td>
              <td style={{ textAlign: "center" }}>
                <FaTrash
                  className="delete"
                  onClick={() => handleDeleteProgramacao(p.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
        {/* ACEITARAM JESUS */}
        {aba === "aceitaramJesus" && (
          <div className="avisos-grid">
            <div className="card">
              <h3><PiUserSwitchLight color="#e02020" /> Estatísticas</h3>
              <div className="total-box">
                <span>Total</span>
                <h1>{aceitaramJesus.length}</h1>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3><PiUserSwitchLight color="#e02020" /> Aceitou Jesus</h3>
                <button onClick={() => gerarPDF("aceitaram-jesus")} className="btn-pdf">
                  <FaFilePdf /> Gerar PDF
                </button>
                <span>Total: {aceitaramJesus.length}</span>
              </div>

              <table className="tabela">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Endereço</th>
                    <th>Observações</th>
                    <th>Data</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {aceitaramJesus.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td>{p.telefone}</td>
                      <td>{p.endereco}</td>
                      <td>{p.observacoes}</td>
                      <td>
                        {p.data
                          ? new Date(p.data).toLocaleString("pt-BR", {
                              timeZone: "America/Sao_Paulo",
                            })
                          : "-"}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <FaTrash
                          className="delete"
                          onClick={() => handleDeleteAceitouJesus(p.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </>
  );
}