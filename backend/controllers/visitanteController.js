import { db } from "../config/db.js";

// LISTAR
export const listarVisitantes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM visitantes");
    return res.json(rows);
  } catch (err) {
    console.error("ERRO LISTAR VISITANTES:", err);
    return res.status(500).json({ error: err.message });
  }
};

// CRIAR
export const criarVisitante = async (req, res) => {
  try {
    const { nome, funcao, telefone, igreja, data } = req.body;

    // VALIDACAO
    if (!nome || !telefone) {
      return res.status(400).json({
        error: "Nome e telefone são obrigatórios",
      });
    }

    console.log("BODY RECEBIDO:", req.body);

    // 🔥 CORREÇÃO DA DATA (ISO -> MySQL)
    let dataFormatada = null;

    if (data) {
      dataFormatada = new Date(data)
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");
    }

    await db.query(
      `INSERT INTO visitantes 
      (nome, funcao, telefone, igreja, \`data\`) 
      VALUES (?, ?, ?, ?, ?)`,
      [
        nome,
        funcao || null,
        telefone,
        igreja || null,
        dataFormatada, // 🔥 agora correto para MySQL
      ]
    );

    return res.status(201).json({
      msg: "Visitante criado com sucesso",
    });
  } catch (err) {
    console.error("ERRO CRIAR VISITANTE:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

// DELETAR
export const deletarVisitante = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID é obrigatório" });
    }

    const [result] = await db.query(
      "DELETE FROM visitantes WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Visitante não encontrado",
      });
    }

    return res.status(200).json({
      msg: "Excluído com sucesso",
    });
  } catch (err) {
    console.error("ERRO DELETAR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};