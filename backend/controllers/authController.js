import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET || "segredo_super";

//  ideal usar banco futuramente
let tokens = [];
// LOGIN
export const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "Email e senha obrigatórios" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ erro: "Usuário não encontrado" });
    }

    const usuario = rows[0];

    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({ erro: "Senha inválida" });
    }

    const token = jwt.sign(
      { id: usuario.id, nivel: usuario.nivel },
      SECRET,
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        nivel: usuario.nivel,
      },
    });
  } catch (err) {
    console.log(" ERRO LOGIN:", err);
    return res.status(500).json({ erro: err.message });
  }
};
// REGISTER
export const register = async (req, res) => {
  const { nome, email, senha, nivel } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos" });
  }

  try {
    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      "INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)",
      [nome, email, hash, nivel || "user"]
    );

    return res.status(201).json({ msg: "Usuário criado" });
  } catch (err) {
    console.log(" ERRO REGISTER:", err);
    return res.status(500).json({ erro: err.message });
  }
};
// EMAIL TRANSPORTER 
const transporter = nodemailer.createTransport({
  service: "gmail",
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//  DEBUG REAL
transporter.verify((error) => {
  if (error) {
    console.log(" ERRO TRANSPORTER:", error);
  } else {
    console.log("EMAIL CONFIGURADO");
  }
});
// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ erro: "Email é obrigatório" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Email não encontrado" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    tokens.push({
      email,
      token,
      expires: Date.now() + 1000 * 60 * 30,
    });

    const frontendURL = (
      process.env.FRONTEND_URL || "http://localhost:5173"
    ).replace(/\/$/, "");

    const link = `${frontendURL}/reset?token=${token}`;

    console.log(" LINK RESET:", link);

    await transporter.sendMail({
      from: `"ADTAG Suporte" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperação de senha",
      html: `
        <h2>Recuperação de senha</h2>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${link}">${link}</a>
        <p>Esse link expira em 30 minutos.</p>
      `,
    });

    return res.json({ msg: "Email enviado com sucesso" });

  } catch (err) {
    //  AGORA VOCÊ VAI VER O ERRO REAL
    console.log(" ERRO REAL EMAIL:", err);

    return res.status(500).json({
      erro: err.message, 
    });
  }
};
// RESET PASSWORD
export const resetPassword = async (req, res) => {
  const { token, novaSenha } = req.body;

  if (!token || !novaSenha) {
    return res.status(400).json({ erro: "Dados inválidos" });
  }

  const registro = tokens.find((t) => t.token === token);

  if (!registro) {
    return res.status(400).json({ erro: "Token inválido ou expirado" });
  }

  if (Date.now() > registro.expires) {
    tokens = tokens.filter((t) => t.token !== token);
    return res.status(400).json({ erro: "Token expirado" });
  }

  try {
    const hash = await bcrypt.hash(novaSenha, 10);

    await db.query(
      "UPDATE usuarios SET senha = ? WHERE email = ?",
      [hash, registro.email]
    );

    tokens = tokens.filter((t) => t.token !== token);

    return res.json({ msg: "Senha atualizada com sucesso" });
  } catch (err) {
    console.log(" ERRO RESET:", err);
    return res.status(500).json({ erro: err.message });
  }
};
// NIVEL POR EMAIL
export const getNivelByEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT nivel FROM usuarios WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado" });
    }

    return res.json({ nivel: rows[0].nivel });
  } catch (err) {
    console.log(" ERRO NIVEL:", err);
    return res.status(500).json({ erro: err.message });
  }
};
//