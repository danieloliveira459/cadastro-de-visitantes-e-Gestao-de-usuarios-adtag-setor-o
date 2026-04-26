import { db } from "../config/db.js";

/* ── normaliza snake_case do MySQL → camelCase pro frontend ── */
function normalizarMembro(m) {
  let dataNascimento = m.data_nascimento ?? m.dataNascimento ?? null;
  if (dataNascimento instanceof Date) {
    dataNascimento = dataNascimento.toISOString().split("T")[0];
  } else if (typeof dataNascimento === "string") {
    dataNascimento = dataNascimento.split("T")[0];
  }

  let createdAt = m.created_at ?? m.createdAt ?? null;
  if (createdAt instanceof Date) createdAt = createdAt.toISOString();

  /* foto: se vier como Buffer do MySQL, converte para base64 */
  let foto = m.foto ?? null;
  if (foto && Buffer.isBuffer(foto)) {
    const mime = m.foto_mime || "image/jpeg";
    foto = `data:${mime};base64,${foto.toString("base64")}`;
  }

  const {
    data_nascimento,
    created_at,
    titulo_eclesiastico,
    estado_civil,
    grau_instrucao,
    foto_mime,
    foto_nome,
    ...resto
  } = m;

  return {
    ...resto,
    foto,
    dataNascimento,
    createdAt,
    tituloEclesiastico: m.titulo_eclesiastico ?? m.tituloEclesiastico ?? null,
    estadoCivil:        m.estado_civil        ?? m.estadoCivil        ?? null,
    grauInstrucao:      m.grau_instrucao      ?? m.grauInstrucao      ?? null,
    fotoMime:           m.foto_mime           ?? m.fotoMime           ?? null,
    fotoNome:           m.foto_nome           ?? m.fotoNome           ?? null,
  };
}

/* ── LISTAR ── */
export const listarJovens = async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM jovens ORDER BY created_at DESC"
    );
    return res.status(200).json(rows.map(normalizarMembro));
  } catch (err) {
    console.error("ERRO LISTAR:", err);
    return res.status(500).json({ error: "Erro ao listar registros" });
  }
};

/* ── CRIAR ── */
export const criarJovem = async (req, res) => {
  try {
    let {
      nome,
      cpf,
      dataNascimento,
      sexo,
      tituloEclesiastico,
      estadoCivil,
      grauInstrucao,
      nacionalidade,
      naturalidade,
      telefone,
      foto,
      fotoMime,
      fotoNome,
    } = req.body;

    if (!nome || nome.trim() === "") {
      return res.status(400).json({ error: "Nome é obrigatório" });
    }

    nome               = nome.trim();
    cpf                = cpf      ? cpf.replace(/\D/g, "")           : null;
    telefone           = telefone ? telefone.replace(/\D/g, "")      : null;
    naturalidade       = naturalidade?.trim()       || null;
    nacionalidade      = nacionalidade?.trim()      || null;
    tituloEclesiastico = tituloEclesiastico?.trim() || null;
    sexo               = sexo         || null;
    estadoCivil        = estadoCivil  || null;
    grauInstrucao      = grauInstrucao || null;
    fotoMime           = fotoMime     || null;
    fotoNome           = fotoNome     || null;
    const data_nascimento = dataNascimento || null;

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

    const [result] = await db.query(
      `INSERT INTO jovens
         (nome, cpf, data_nascimento, sexo, titulo_eclesiastico,
          estado_civil, grau_instrucao, nacionalidade, naturalidade,
          telefone, foto, foto_mime, foto_nome)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nome, cpf, data_nascimento, sexo, tituloEclesiastico,
        estadoCivil, grauInstrucao, nacionalidade, naturalidade,
        telefone, fotoBuffer, fotoMime, fotoNome,
      ]
    );

    const [rows] = await db.query("SELECT * FROM jovens WHERE id = ?", [result.insertId]);
    return res.status(201).json(normalizarMembro(rows[0]));
  } catch (err) {
    console.error("ERRO CRIAR:", err);
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "CPF já cadastrado." });
    return res.status(500).json({ error: "Erro ao cadastrar" });
  }
};

/* ── DELETAR ── */
export const deletarJovem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "ID é obrigatório" });

    const [result] = await db.query("DELETE FROM jovens WHERE id = ?", [id]);

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Registro não encontrado" });

    return res.status(200).json({ msg: "Excluído com sucesso" });
  } catch (err) {
    console.error("ERRO DELETAR:", err);
    return res.status(500).json({ error: "Erro ao deletar" });
  }
};
