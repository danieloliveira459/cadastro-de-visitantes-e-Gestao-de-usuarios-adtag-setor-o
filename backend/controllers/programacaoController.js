import { db } from "../config/db.js";

// ─── LISTAR ───────────────────────────────────────────────────────────────────
export const listarProgramacao = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        dia,
        horario,
        atividade,
        data,
        dataAtividade
      FROM programacao
      ORDER BY id DESC
    `);

    return res.status(200).json(rows);
  } catch (err) {
    console.error("[PROGRAMACAO] Erro ao listar:", err);
    return res.status(500).json({ error: "Erro interno ao listar programações." });
  }
};

// ─── CRIAR ────────────────────────────────────────────────────────────────────
export const criarProgramacao = async (req, res) => {
  try {
    const { dia, horario, atividade, dataAtividade } = req.body ?? {};

    if (!dia?.trim() || !horario?.trim() || !atividade?.trim()) {
      return res.status(400).json({
        error: "Dia, horário e atividade são obrigatórios.",
      });
    }

    const dataCadastro = new Date().toISOString().slice(0, 19).replace("T", " ");
    const dataAtividadeFormatada = dataAtividade?.trim() || null;

    await db.query(
      `INSERT INTO programacao (dia, horario, atividade, data, dataAtividade)
       VALUES (?, ?, ?, ?, ?)`,
      [dia.trim(), horario.trim(), atividade.trim(), dataCadastro, dataAtividadeFormatada]
    );

    return res.status(201).json({ msg: "Programação criada com sucesso." });
  } catch (err) {
    console.error("[PROGRAMACAO] Erro ao criar:", err);
    return res.status(500).json({ error: "Erro interno ao criar programação." });
  }
};

// ─── EDITAR ───────────────────────────────────────────────────────────────────
export const editarProgramacao = async (req, res) => {
  try {
    const { id } = req.params;
    const { dia, horario, atividade, dataAtividade } = req.body ?? {};

    if (!dia?.trim() || !horario?.trim() || !atividade?.trim()) {
      return res.status(400).json({
        error: "Dia, horário e atividade são obrigatórios.",
      });
    }

    const dataAtividadeFormatada = dataAtividade?.trim() || null;

    const [result] = await db.query(
      `UPDATE programacao
       SET dia = ?, horario = ?, atividade = ?, dataAtividade = ?
       WHERE id = ?`,
      [dia.trim(), horario.trim(), atividade.trim(), dataAtividadeFormatada, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Programação não encontrada." });
    }

    return res.status(200).json({ msg: "Programação atualizada com sucesso." });
  } catch (err) {
    console.error("[PROGRAMACAO] Erro ao editar:", err);
    return res.status(500).json({ error: "Erro interno ao editar programação." });
  }
};

// ─── DELETAR ──────────────────────────────────────────────────────────────────
export const deletarProgramacao = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID é obrigatório." });
    }

    const [result] = await db.query(
      "DELETE FROM programacao WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Programação não encontrada." });
    }

    return res.status(200).json({ msg: "Programação excluída com sucesso." });
  } catch (err) {
    console.error("[PROGRAMACAO] Erro ao deletar:", err);
    return res.status(500).json({ error: "Erro interno ao deletar programação." });
  }
};
