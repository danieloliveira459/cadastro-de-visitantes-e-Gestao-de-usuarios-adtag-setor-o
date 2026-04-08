import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

import visitanteRoutes from "./routes/visitanteRoutes.js";
import aceitaramJesusRoutes from "./routes/aceitaramJesusRoutes.js";
import avisoRoutes from "./routes/avisoRoutes.js";
import programacaoRoutes from "./routes/programacaoRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Corrigir __dirname no ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// 🌐 CORS CONFIGURADO
// =========================
const allowedOrigins = [
  "http://localhost:5173",
  "https://cadastro-de-visitantes-e-gestao-de-ukhv.onrender.com", // corrigido typo
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Garante resposta ao preflight
app.options("*", cors());

// =========================
// 🧩 MIDDLEWARE
// =========================
app.use(express.json());

// =========================
// 🚀 ROTAS API
// =========================
app.use("/api/visitantes", visitanteRoutes);
app.use("/api/aceitaramJesus", aceitaramJesusRoutes);
app.use("/api/avisos", avisoRoutes);
app.use("/api/programacoes", programacaoRoutes);
app.use("/api/auth", authRoutes);

// =========================
// 🧪 TESTE API
// =========================
app.get("/api", (req, res) => {
  res.json({ message: "🚀 API rodando com sucesso!" });
});

// =========================
// 🌍 FRONTEND (React)
// =========================
const frontendPath = path.join(__dirname, "../frontend/dist");

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  console.warn("⚠️ Pasta dist não encontrada. Frontend não será servido.");
}

// =========================
// ❌ 404 SOMENTE API
// =========================
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Rota da API não encontrada" });
});

// =========================
// 🚀 START
// =========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});

// =========================
// 🛡️ LOGS DE ERRO GLOBAIS
// =========================
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});
