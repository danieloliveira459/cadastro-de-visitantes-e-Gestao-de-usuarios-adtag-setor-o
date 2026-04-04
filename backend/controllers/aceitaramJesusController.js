import { db } from "../config/db.js";

// LISTAR
export const listarAceitaram = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM aceitaram_jesus");
    return res.json(rows);
  } catch (err) {
    console.error("ERRO LISTAR:", err);
    return res.status(500).json({ error: err.message });
  }
};

// CRIAR
export const criarAceitou = async (req, res) => {
  try {
    const { nome, telefone, endereco, observacoes } = req.body;

    // 🔥 VALIDAÇÃO (evita crash silencioso)
    if (!nome || !telefone) {
      return res.status(400).json({
        error: "Nome e telefone são obrigatórios",
      });
    }

    console.log("BODY RECEBIDO:", req.body);

    await db.query(
      `INSERT INTO aceitaram_jesus 
      (nome, telefone, endereco, observacoes)
      VALUES (?, ?, ?, ?)`,
      [
        nome,
        telefone,
        endereco || null,
        observacoes || null,
      ]
    );

    return res.status(201).json({
      msg: "Registro salvo com sucesso",
    });
  } catch (err) {
    console.error("ERRO CRIAR:", err);

    return res.status(500).json({
      error: err.message,
    });
  }
};

// DELETAR
export const deletarAceitou = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "ID é obrigatório",
      });
    }

    const [result] = await db.query(
      "DELETE FROM aceitaram_jesus WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: "Registro não encontrado",
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