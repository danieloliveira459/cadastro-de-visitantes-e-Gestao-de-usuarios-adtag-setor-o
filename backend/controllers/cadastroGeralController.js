import { db } from "../config/db.js";
import { getSegundaFeira } from "../utils/semana.js";

// LISTAR — só da semana atual
export const listarCadastroGeral = async (req, res) => {
  try {
    const semana = getSegundaFeira();
    const [rows] = await db.query(
      "SELECT * FROM cadastro_geral WHERE semana = ? ORDER BY data DESC",
      [semana]
    );
    return res.status(200).json(rows);
  } catch (err) {
    console.error("ERRO LISTAR:", err);
    return res.status(500).json({ error: "Erro ao listar registros" });
  }
};

// CRIAR — salva com a semana atual
export const criarCadastroGeral = async (req, res) => {
  try {
    let {
      nome,
      idade,
      telefone,
      endereco,
      observacoes,
      /* novos campos */
      cpf,
      dataNascimento,
      sexo,
      tituloEclesiastico,
      estadoCivil,
      grauInstrucao,
      nacionalidade,
      naturalidade,
      foto,
      fotoMime,
      fotoNome,
    } = req.body;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    nome               = nome.trim();
    endereco           = endereco?.trim()           || null;
    observacoes        = observacoes?.trim()        || null;
    telefone           = telefone ? telefone.replace(/\D/g, "") : null;
    cpf                = cpf      ? cpf.replace(/\D/g, "")      : null;
    naturalidade       = naturalidade?.trim()       || null;
    nacionalidade      = nacionalidade?.trim()      || null;
    tituloEclesiastico = tituloEclesiastico?.trim() || null;
    sexo               = sexo               || null;
    estadoCivil        = estadoCivil        || null;
    grauInstrucao      = grauInstrucao      || null;
    const data_nascimento = dataNascimento  || null;
    fotoMime           = fotoMime           || null;
    fotoNome           = fotoNome           || null;

    /* converte base64 → Buffer para o LONGBLOB */
    let fotoBuffer = null;
    if (foto) {
      const match = foto.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        fotoMime   = fotoMime || match[1];
        fotoBuffer = Buffer.from(match[2], "base64");
      } else {
        fotoBuffer = Buffer.from(foto, "base64");
      }
    }

    const semana = getSegundaFeira();

    const [result] = await db.query(
      `INSERT INTO cadastro_geral
         (nome, idade, telefone, endereco, observacoes, semana,
          cpf, data_nascimento, sexo, titulo_eclesiastico,
          estado_civil, grau_instrucao, nacionalidade, naturalidade,
          foto, foto_mime, foto_nome)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome, idade, telefone, endereco, observacoes, semana,
        cpf, data_nascimento, sexo, tituloEclesiastico,
        estadoCivil, grauInstrucao, nacionalidade, naturalidade,
        fotoBuffer, fotoMime, fotoNome,
      ]
    );

    return res.status(201).json({ msg: "Registro salvo com sucesso", id: result.insertId });
  } catch (err) {
    console.error("ERRO CRIAR:", err);
    return res.status(500).json({ error: "Erro ao cadastrar" });
  }
};

// DELETAR
export const deletarCadastroGeral = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "ID é obrigatório" });

    const [result] = await db.query("DELETE FROM cadastro_geral WHERE id = ?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Registro não encontrado" });

    return res.status(200).json({ msg: "Excluído com sucesso" });
  } catch (err) {
    console.error("ERRO DELETAR:", err);
    return res.status(500).json({ error: "Erro ao deletar" });
  }
};
