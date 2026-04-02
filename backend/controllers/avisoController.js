import { db } from "../config/db.js";

export const listarAvisos = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM avisos");
    res.json(rows);
  } catch (err) {
    console.log("ERRO LISTAR:", err);
    res.status(500).json(err);
  }
};

export const criarAviso = async (req, res) => {
  const { titulo, descricao } = req.body;

  try {
    await db.query(
      "INSERT INTO avisos (titulo, descricao, data) VALUES (?, ?, ?)",
      [titulo, descricao, new Date()]
    );

    res.status(201).json({ msg: "Aviso criado" });
  } catch (err) {
    console.log("ERRO CRIAR:", err);
    res.status(500).json(err);
  }
};

export const deletarAviso = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM avisos WHERE id = ?", [id]);

    res.status(200).json({ msg: "Excluído com sucesso" });
  } catch (err) {
    console.log("ERRO DELETAR:", err);
    res.status(500).json(err);
  }
};