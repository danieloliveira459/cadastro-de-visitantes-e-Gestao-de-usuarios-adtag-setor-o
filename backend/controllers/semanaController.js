import { db } from "../config/db.js";
import { getSegundaFeira } from "../utils/semana.js";

// ─── LISTAR SEMANAS (histórico) ───────────────────────────────────────────────
export const listarSemanas = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT semana FROM (
        SELECT semana FROM visitantes      WHERE semana IS NOT NULL
        UNION ALL
        SELECT semana FROM aceitaram_jesus WHERE semana IS NOT NULL
        UNION ALL
        SELECT semana FROM cadastro_geral  WHERE semana IS NOT NULL
        UNION ALL
        SELECT semana FROM avisos          WHERE semana IS NOT NULL
        UNION ALL
        SELECT semana FROM programacao     WHERE semana IS NOT NULL
        UNION ALL
        SELECT semana FROM crianca         WHERE semana IS NOT NULL
        UNION ALL
        SELECT semana FROM jovens          WHERE semana IS NOT NULL
        UNION ALL
        SELECT semana FROM mulheres        WHERE semana IS NOT NULL
        UNION ALL
        SELECT semana FROM homens          WHERE semana IS NOT NULL
      ) AS todas
      ORDER BY semana DESC
    `);

    const semanaAtual = getSegundaFeira();

    const semanas = await Promise.all(
      rows.map(async ({ semana }) => {
        const [
          [v], [a], [cg], [av], [pr], [cr], [jo], [mu], [ho],
        ] = await Promise.all([
          db.query("SELECT COUNT(*) AS total FROM visitantes      WHERE semana = ?", [semana]),
          db.query("SELECT COUNT(*) AS total FROM aceitaram_jesus WHERE semana = ?", [semana]),
          db.query("SELECT COUNT(*) AS total FROM cadastro_geral  WHERE semana = ?", [semana]),
          db.query("SELECT COUNT(*) AS total FROM avisos          WHERE semana = ?", [semana]),
          db.query("SELECT COUNT(*) AS total FROM programacao     WHERE semana = ?", [semana]),
          db.query("SELECT COUNT(*) AS total FROM crianca         WHERE semana = ?", [semana]),
          db.query("SELECT COUNT(*) AS total FROM jovens          WHERE semana = ?", [semana]),
          db.query("SELECT COUNT(*) AS total FROM mulheres        WHERE semana = ?", [semana]),
          db.query("SELECT COUNT(*) AS total FROM homens          WHERE semana = ?", [semana]),
        ]);

        const seg = new Date(semana + "T00:00:00");
        const sab = new Date(seg);
        sab.setDate(seg.getDate() + 5);
        const fim = sab.toISOString().split("T")[0];

        return {
          semana,
          fim,
          atual: semana === semanaAtual,
          visitantes:     Number(v[0].total),
          aceitaramJesus: Number(a[0].total),
          cadastroGeral:  Number(cg[0].total),
          avisos:         Number(av[0].total),
          programacoes:   Number(pr[0].total),
          criancas:       Number(cr[0].total),
          jovens:         Number(jo[0].total),
          mulheres:       Number(mu[0].total),
          homens:         Number(ho[0].total),
        };
      })
    );

    return res.json(semanas);
  } catch (err) {
    console.error("ERRO LISTAR SEMANAS:", err);
    return res.status(500).json({ error: "Erro ao listar semanas" });
  }
};

// ─── DADOS DE UMA SEMANA ESPECÍFICA ──────────────────────────────────────────
export const dadosDaSemana = async (req, res) => {
  try {
    const { semana } = req.params;

    if (!semana || !/^\d{4}-\d{2}-\d{2}$/.test(semana)) {
      return res.status(400).json({ error: "Parâmetro semana inválido. Use YYYY-MM-DD." });
    }

    const [
      [visitantes],
      [aceitaramJesus],
      [cadastroGeral],
      [avisos],
      [programacoes],
      [criancas],
      [jovens],
      [mulheres],
      [homens],
    ] = await Promise.all([
      db.query("SELECT * FROM visitantes      WHERE semana = ? ORDER BY id DESC",         [semana]),
      db.query("SELECT * FROM aceitaram_jesus WHERE semana = ? ORDER BY data DESC",       [semana]),
      db.query("SELECT * FROM cadastro_geral  WHERE semana = ? ORDER BY data DESC",       [semana]),
      db.query("SELECT * FROM avisos          WHERE semana = ? ORDER BY id DESC",         [semana]),
      db.query(
        "SELECT id, dia, horario, atividade, data, dataAtividade FROM programacao WHERE semana = ? ORDER BY id DESC",
        [semana]
      ),
      db.query("SELECT * FROM crianca  WHERE semana = ? ORDER BY created_at DESC",        [semana]),
      db.query("SELECT * FROM jovens   WHERE semana = ? ORDER BY created_at DESC",        [semana]),
      db.query("SELECT * FROM mulheres WHERE semana = ? ORDER BY created_at DESC",        [semana]),
      db.query("SELECT * FROM homens   WHERE semana = ? ORDER BY created_at DESC",        [semana]),
    ]);

    return res.json({
      visitantes, aceitaramJesus, cadastroGeral,
      avisos, programacoes,
      criancas, jovens, mulheres, homens,
    });
  } catch (err) {
    console.error("ERRO DADOS SEMANA:", err);
    return res.status(500).json({ error: "Erro ao buscar dados da semana" });
  }
};

// ─── RELATÓRIO MENSAL ─────────────────────────────────────────────────────────
// GET /api/semanas/relatorio-mensal?mes=4&ano=2026
// Retorna TODOS os registros do mês inteiro de todas as tabelas,
// agrupando por semana dentro do mês. Os dados nunca são apagados do banco,
// portanto mesmo após o reset semanal do front, o relatório continua completo.
export const relatorioMensal = async (req, res) => {
  try {
    const mes = parseInt(req.query.mes) || new Date().getMonth() + 1;
    const ano = parseInt(req.query.ano) || new Date().getFullYear();

    if (mes < 1 || mes > 12) {
      return res.status(400).json({ error: "Mês inválido. Use 1-12." });
    }

    // primeiro e último dia do mês
    const inicio = `${ano}-${String(mes).padStart(2, "0")}-01`;
    const fim    = new Date(ano, mes, 0).toISOString().split("T")[0];

    const [
      [visitantes],
      [aceitaramJesus],
      [avisos],
      [programacoes],
      [criancas],
      [jovens],
      [mulheres],
      [homens],
      [cadastroGeral],
    ] = await Promise.all([
      db.query(
        "SELECT * FROM visitantes WHERE semana >= ? AND semana <= ? ORDER BY semana ASC, id ASC",
        [inicio, fim]
      ),
      db.query(
        "SELECT * FROM aceitaram_jesus WHERE semana >= ? AND semana <= ? ORDER BY semana ASC, data ASC",
        [inicio, fim]
      ),
      db.query(
        "SELECT * FROM avisos WHERE semana >= ? AND semana <= ? ORDER BY semana ASC, id ASC",
        [inicio, fim]
      ),
      db.query(
        `SELECT id, dia, horario, atividade, data, dataAtividade, semana
         FROM programacao WHERE semana >= ? AND semana <= ? ORDER BY semana ASC`,
        [inicio, fim]
      ),
      db.query(
        "SELECT * FROM crianca WHERE semana >= ? AND semana <= ? ORDER BY semana ASC, created_at ASC",
        [inicio, fim]
      ),
      db.query(
        "SELECT * FROM jovens WHERE semana >= ? AND semana <= ? ORDER BY semana ASC, created_at ASC",
        [inicio, fim]
      ),
      db.query(
        "SELECT * FROM mulheres WHERE semana >= ? AND semana <= ? ORDER BY semana ASC, created_at ASC",
        [inicio, fim]
      ),
      db.query(
        "SELECT * FROM homens WHERE semana >= ? AND semana <= ? ORDER BY semana ASC, created_at ASC",
        [inicio, fim]
      ),
      db.query(
        "SELECT * FROM cadastro_geral WHERE semana >= ? AND semana <= ? ORDER BY semana ASC, data ASC",
        [inicio, fim]
      ),
    ]);

    return res.json({
      mes,
      ano,
      inicio,
      fim,
      totais: {
        visitantes:     visitantes.length,
        aceitaramJesus: aceitaramJesus.length,
        avisos:         avisos.length,
        programacoes:   programacoes.length,
        criancas:       criancas.length,
        jovens:         jovens.length,
        mulheres:       mulheres.length,
        homens:         homens.length,
        cadastroGeral:  cadastroGeral.length,
        membros:        criancas.length + jovens.length + mulheres.length + homens.length,
      },
      visitantes,
      aceitaramJesus,
      avisos,
      programacoes,
      criancas,
      jovens,
      mulheres,
      homens,
      cadastroGeral,
    });
  } catch (err) {
    console.error("ERRO RELATÓRIO MENSAL:", err);
    return res.status(500).json({ error: "Erro ao gerar relatório mensal" });
  }
};
