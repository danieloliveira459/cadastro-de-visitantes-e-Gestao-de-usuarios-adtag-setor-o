import { db } from "../config/db.js";

// LISTAR
export const listarProgramacao = async (req, res) => {
  try {
    // ✅ CORRIGIDO: alias explícito garante que o campo chega como "dataAtividade"
    // independentemente do casing padrão do MySQL
    const [rows] = await db.query(`
      SELECT
        id,
        dia,
        horario,
        atividade,
        data,
        dataAtividade AS dataAtividade
      FROM programacao
      ORDER BY id DESC
    `);

    return res.status(200).json(rows);
  } catch (err) {
    console.error("ERRO LISTAR PROGRAMAÇÕES:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

// CRIAR
export const criarProgramacao = async (req, res) => {
  try {
    console.log("BODY RECEBIDO:", req.body);
    const { dia, horario, atividade, dataAtividade } = req.body;

    // validação
    if (!dia || !horario || !atividade) {
      return res.status(400).json({
        error: "Dia, horário e atividade são obrigatórios",
      });
    }

    // data automática cadastro
    const dataCadastro = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // ✅ evita salvar string vazia — salva null se não informado
    const dataAtividadeFormatada =
      dataAtividade && dataAtividade.trim() !== ""
        ? dataAtividade.trim()
        : null;

    console.log("dataAtividade recebida:", dataAtividade);
    console.log("dataAtividade formatada para salvar:", dataAtividadeFormatada);

    const sql = `
      INSERT INTO programacao
      (
        dia,
        horario,
        atividade,
        data,
        dataAtividade
      )
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(sql, [
      dia,
      horario,
      atividade,
      dataCadastro,
      dataAtividadeFormatada,
    ]);

    return res.status(201).json({
      msg: "Programação criada com sucesso",
    });
  } catch (err) {
    console.error("ERRO CRIAR PROGRAMAÇÃO:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

// DELETAR
export const deletarProgramacao = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "ID é obrigatório",
      });
    }

    const [result] = await db.query(
      "DELETE FROM programacao WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Programação não encontrada",
      });
    }

    return res.status(200).json({
      msg: "Programação excluída com sucesso",
    });
  } catch (err) {
    console.error("ERRO DELETAR PROGRAMAÇÃO:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};
