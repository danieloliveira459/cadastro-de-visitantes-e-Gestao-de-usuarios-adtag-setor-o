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
import cadastroGeral from "./routes/cadastroGeralRoutes.js";
import criancas from "./routes/criancaRoutes.js";
import jovens from "./routes/jovemRoutes.js";
import irmas from "./routes/irmaRoutes.js";
import homens from "./routes/homemRoutes.js";


const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const allowedOrigins = [
  "http://localhost:5173",
  "https://cadatro-de-visitantes-e-gest-o-de-ukhv.onrender.com",
];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());

// ROTAS API
app.use("/api/visitantes", visitanteRoutes);
app.use("/api/aceitaram-jesus", aceitaramJesusRoutes);
app.use("/api/avisos", avisoRoutes);
app.use("/api/programacoes", programacaoRoutes);
app.use("/api/auth", authRoutes);
app.use ("/api/cadastro-geral", cadastroGeral);
app.use ("/api/criancas", criancas)
app.use ("/api/jovens", jovens);
app.use ("/api/irmas", irmas);
app.use ("/api/homens", homens);


app.get("/api", (req, res) => {
  res.json({ message: "API rodando com sucesso!" });
});

// FRONTEND (React)
const frontendPath = path.join(__dirname, "../frontend/dist");

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // ← CORRIGIDO: sem next, qualquer rota não-API serve o index.html
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return;
    res.sendFile(path.join(frontendPath, "index.html"));
  });
} else {
  console.warn("Pasta dist não encontrada. Frontend não será servido.");
}

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Rota da API não encontrada" });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});