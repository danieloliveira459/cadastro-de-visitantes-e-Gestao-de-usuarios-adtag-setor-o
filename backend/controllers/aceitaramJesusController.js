import { db } from "../config/db.js";

export const listarAceitaram = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM aceitaram_jesus");
    res.json(rows);
  } catch (err) {
    console.log("ERRO LISTAR:", err);
    res.status(500).json(err);
  }
};

export const criarAceitou = async (req, res) => {
  const { nome, telefone, endereco, observacoes } = req.body;

  try {
    await db.query(
      "INSERT INTO aceitaram_jesus (nome, telefone, endereco, observacoes) VALUES (?, ?, ?, ?)",
      [nome, telefone, endereco, observacoes]
    );

    res.status(201).json({ msg: "OK" });
  } catch (err) {
    console.log("ERRO CRIAR:", err);
    res.status(500).json(err);
  }
};

export const deletarAceitou = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query("DELETE FROM aceitaram_jesus WHERE id = ?", [id]);

    res.status(200).json({ msg: "Excluído com sucesso" });
  } catch (err) {
    console.log("ERRO DELETAR:", err);
    res.status(500).json(err);
  }
};