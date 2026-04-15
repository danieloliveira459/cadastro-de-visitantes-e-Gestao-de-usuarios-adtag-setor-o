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

// ✅ ROTAS MEMBROS (PADRONIZADO)
import cadastroGeralRoutes from "./routes/cadastroGeralRoutes.js";
import criancasRoutes from "./routes/criancasRoutes.js";
import jovensRoutes from "./routes/jovensRoutes.js";
import irmasRoutes from "./routes/irmasRoutes.js";
import homensRoutes from "./routes/homensRoutes.js";

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

/* ================= ROTAS API ================= */

app.use("/api/visitantes", visitanteRoutes);
app.use("/api/aceitaram-jesus", aceitaramJesusRoutes);
app.use("/api/avisos", avisoRoutes);
app.use("/api/programacoes", programacaoRoutes);
app.use("/api/auth", authRoutes);

/* ================= ROTAS MEMBROS ================= */

app.use("/api/cadastro-geral", cadastroGeralRoutes);
app.use("/api/criancas", criancasRoutes);
app.use("/api/jovens", jovensRoutes);
app.use("/api/irmas", irmasRoutes);
app.use("/api/homens", homensRoutes);

/* ================= TESTE API ================= */

app.get("/api", (req, res) => {
  res.json({ message: "API rodando com sucesso!" });
});

/* ================= FRONTEND ================= */

const frontendPath = path.join(__dirname, "../frontend/dist");

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return;
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

/* ================= 404 API ================= */

app.use("/api", (req, res) => {
  res.status(404).json({ message: "Rota da API não encontrada" });
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});