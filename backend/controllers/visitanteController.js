import { db } from "../config/db.js";

// LISTAR
export const listarVisitantes = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM visitantes ORDER BY id DESC"
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error("ERRO LISTAR VISITANTES:", err);

    return res.status(500).json({
      error: "Erro ao listar visitantes",
    });
  }
};

// CRIAR
export const criarVisitante = async (req, res) => {
  try {
    let { nome, funcao, telefone, igreja } = req.body;

    // ✅ SOMENTE NOME OBRIGATÓRIO
    if (!nome || nome.trim() === "") {
      return res.status(400).json({
        error: "Nome é obrigatório",
      });
    }

    // 🔥 LIMPEZA DE DADOS
    nome = nome.trim();
    funcao = funcao?.trim() || null;
    igreja = igreja?.trim() || null;

    // remove máscara do telefone (fica só número)
    telefone = telefone ? telefone.replace(/\D/g, "") : null;

    console.log("BODY TRATADO:", {
      nome,
      funcao,
      telefone,
      igreja,
    });

    await db.query(
      `INSERT INTO visitantes 
      (nome, funcao, telefone, igreja, data) 
      VALUES (?, ?, ?, ?, NOW())`,
      [
        nome,
        funcao,
        telefone,
        igreja,
      ]
    );

    return res.status(201).json({
      msg: "Visitante criado com sucesso",
    });

  } catch (err) {
    console.error("ERRO CRIAR VISITANTE:", err);

    return res.status(500).json({
      error: "Erro ao criar visitante",
    });
  }
};

// DELETAR
export const deletarVisitante = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: "ID é obrigatório",
      });
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
      msg: "Visitante excluído com sucesso",
    });

  } catch (err) {
    console.error("ERRO DELETAR:", err);

    return res.status(500).json({
      error: "Erro ao deletar visitante",
    });
  }
};