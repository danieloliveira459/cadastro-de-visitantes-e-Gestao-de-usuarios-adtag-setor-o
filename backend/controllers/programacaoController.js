import { db } from "../config/db.js";

// LISTAR
export const listarProgramacoes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM programacao");
    return res.json(rows);
  } catch (err) {
    console.error("ERRO LISTAR PROGRAMAÇÕES:", err);
    return res.status(500).json({ error: err.message });
  }
};

// CRIAR
export const criarProgramacao = async (req, res) => {
  try {
    const { dia, horario, atividade, data } = req.body;

    // validação básica
    if (!dia || !horario || !atividade) {
      return res.status(400).json({
        error: "Dia, horário e atividade são obrigatórios",
      });
    }

    console.log("BODY RECEBIDO:", req.body);

    // 🔥 CORREÇÃO DEFINITIVA DA DATA (MySQL safe)
    let dataFormatada;

    if (data) {
      dataFormatada = new Date(data)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    } else {
      dataFormatada = new Date()
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    }

    await db.query(
      `INSERT INTO programacao (dia, horario, atividade, data)
       VALUES (?, ?, ?, ?)`,
      [dia, horario, atividade, dataFormatada]
    );

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
      msg: "Excluído com sucesso",
    });
  } catch (err) {
    console.error("ERRO DELETAR PROGRAMAÇÃO:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};