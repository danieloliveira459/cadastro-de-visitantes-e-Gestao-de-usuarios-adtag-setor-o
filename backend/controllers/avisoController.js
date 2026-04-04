import { db } from "../config/db.js";

// LISTAR AVISOS
export const listarAvisos = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM aviso");
    return res.json(rows);
  } catch (err) {
    console.error("ERRO LISTAR AVISOS:", err);
    return res.status(500).json({ error: err.message });
  }
};

// CRIAR AVISO
export const criarAviso = async (req, res) => {
  try {
    const { titulo, mensagem, data } = req.body;

    if (!titulo || !mensagem) {
      return res.status(400).json({
        error: "Título e mensagem são obrigatórios",
      });
    }

    const dataFormatada = (data ? new Date(data) : new Date())
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await db.query(
      `INSERT INTO aviso (titulo, mensagem, data)
       VALUES (?, ?, ?)`,
      [titulo, mensagem, dataFormatada]
    );

    return res.status(201).json({
      msg: "Aviso criado com sucesso",
    });
  } catch (err) {
    console.error("ERRO CRIAR AVISO:", err);
    return res.status(500).json({ error: err.message });
  }
};

// DELETAR AVISO
export const deletarAviso = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "ID é obrigatório",
      });
    }

    const [result] = await db.query(
      "DELETE FROM aviso WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Aviso não encontrado",
      });
    }

    return res.json({
      msg: "Aviso excluído com sucesso",
    });
  } catch (err) {
    console.error("ERRO DELETAR AVISO:", err);
    return res.status(500).json({ error: err.message });
  }
};