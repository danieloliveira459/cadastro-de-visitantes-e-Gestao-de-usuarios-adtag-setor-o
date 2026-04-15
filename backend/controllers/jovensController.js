import { db } from "../config/db.js";

// LISTAR
export const listarJovens = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM jovens ORDER BY data DESC"
    );

    return res.status(200).json(rows);
  } catch (err) {
    console.error("ERRO LISTAR:", err);
    return res.status(500).json({ error: "Erro ao listar registros" });
  }
};

// CRIAR
export const criarJovem = async (req, res) => {
  try {
    let { nome, idade, telefone, endereco, observacoes } = req.body;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    nome = nome.trim();
    endereco = endereco?.trim() || null;
    observacoes = observacoes?.trim() || null;
    telefone = telefone ? telefone.replace(/\D/g, "") : null;

    console.log("BODY TRATADO:", { nome, idade, telefone, endereco, observacoes });

    const [result] = await db.query(
      `INSERT INTO jovens (nome, idade, telefone, endereco, observacoes)
       VALUES (?, ?, ?, ?, ?)`,
      [nome, idade, telefone, endereco, observacoes]
    );

    return res.status(201).json({
      msg: "Registro salvo com sucesso",
      id: result.insertId,
    });

  } catch (err) {
    console.error("ERRO CRIAR:", err);
    return res.status(500).json({ error: "Erro ao cadastrar" });
  }
};

// DELETAR
export const deletarJovem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "ID é obrigatório" });
    }

    const [result] = await db.query("DELETE FROM jovens WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Registro não encontrado" });
    }

    return res.status(200).json({ msg: "Excluído com sucesso" });

  } catch (err) {
    console.error("ERRO DELETAR:", err);
    return res.status(500).json({ error: "Erro ao deletar" });
  }
};
