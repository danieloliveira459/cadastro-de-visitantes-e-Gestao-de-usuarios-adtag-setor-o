import { db } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const SECRET = "segredo_super";

let tokens = [];
// LOGIN
export const login = async (req, res) => {
  const { email, senha } = req.body;

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

    res.json({
      token,
      usuario,
    });

  } catch (err) {
    console.log(" ERRO LOGIN:", err);
    res.status(500).json({ erro: err.message });
  }
};
// REGISTER
export const register = async (req, res) => {
  const { nome, email, senha, nivel } = req.body;

  try {
    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      "INSERT INTO usuarios (nome, email, senha, nivel) VALUES (?, ?, ?, ?)",
      [nome, email, hash, nivel]
    );

    res.status(201).json({ msg: "Usuário criado" });

  } catch (err) {
    console.log(" ERRO REGISTER:", err);
    res.status(500).json({ erro: err.message });
  }
};
// EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// TESTA CONEXÃO COM EMAIL
transporter.verify((error, success) => {
  if (error) {
    console.log(" Erro no transporter:", error);
  } else {
    console.log(" Servidor de email pronto");
  }
});
// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  console.log(" BODY:", req.body);

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

    tokens.push({ email, token });

    const link = `http://localhost:5173/reset?token=${token}`;

    console.log(" Enviando email para:", email);

    await transporter.sendMail({
      from: `"ADTAG recuperação de senha" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperação de senha",
      html: `
        <h2>Recuperar senha</h2>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${link}">${link}</a>
        <p>Se não foi você, ignore este email.</p>
      `,
    });

    res.json({ msg: "Email enviado com sucesso" });

  } catch (err) {
    console.log(" ERRO FORGOT:", err);
    res.status(500).json({ erro: err.message });
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
    return res.status(400).json({ erro: "Token inválido" });
  }

  try {
    const hash = await bcrypt.hash(novaSenha, 10);

    await db.query(
      "UPDATE usuarios SET senha = ? WHERE email = ?",
      [hash, registro.email]
    );

    tokens = tokens.filter((t) => t.token !== token);

    res.json({ msg: "Senha atualizada com sucesso" });

  } catch (err) {
    console.log(" ERRO RESET:", err);
    res.status(500).json({ erro: err.message });
  }
};

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

    res.json({ nivel: rows[0].nivel });

  } catch (err) {
    console.log("ERRO NIVEL:", err);
    res.status(500).json({ erro: err.message });
  }
};