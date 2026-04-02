import { db } from "../config/db.js";

export const listarVisitantes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM visitantes");
    res.json(rows);
  } catch (err) {
    console.log("ERRO LISTAR VISITANTES:", err);
    res.status(500).json(err);
  }
};

export const criarVisitante = async (req, res) => {
  const { nome, funcao, telefone, igreja, data } = req.body;

  try {
    await db.query(
      "INSERT INTO visitantes (nome, funcao, telefone, igreja, data) VALUES (?, ?, ?, ?, ?)",
      [nome, funcao, telefone, igreja, data]
    );

    res.status(201).json({ msg: "OK" });
  } catch (err) {
    console.log("ERRO CRIAR VISITANTE:", err);
    res.status(500).json(err);
  }
};

export const deletarVisitante = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM visitantes WHERE id = ?", [id]);

    res.status(200).json({ msg: "Excluído com sucesso" });
  } catch (err) {
    console.log("ERRO DELETAR:", err);
    res.status(500).json(err);
  }
};