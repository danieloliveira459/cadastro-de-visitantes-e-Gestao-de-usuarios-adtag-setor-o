import { db } from "../config/db.js";

export const listarProgramacoes = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM programacao");
    res.json(rows);
  } catch (err) {
    console.log("ERRO LISTAR PROGRAMAÇÕES:", err);
    res.status(500).json(err);
  }
};

export const criarProgramacao = async (req, res) => {
  const { dia, horario, atividade } = req.body;

  const data = new Date();

  try {
    await db.query(
      "INSERT INTO programacao (dia, horario, atividade, data) VALUES (?, ?, ?, ?)",
      [dia, horario, atividade, data]
    );

    res.status(201).json({ msg: "OK" });
  } catch (err) {
    console.log("ERRO CRIAR PROGRAMAÇÃO:", err);
    res.status(500).json(err);
  }
};

export const deletarProgramacao = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM programacao WHERE id = ?", [id]);

    res.status(200).json({ msg: "Excluído com sucesso" });
  } catch (err) {
    console.log("ERRO DELETAR:", err);
    res.status(500).json(err);
  }
};