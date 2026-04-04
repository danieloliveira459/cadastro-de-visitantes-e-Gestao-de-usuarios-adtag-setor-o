import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ROTAS
import visitanteRoutes from "./routes/visitanteRoutes.js";
import aceitaramJesusRoutes from "./routes/aceitaramJesusRoutes.js";
import avisoRoutes from "./routes/avisoRoutes.js";
import programacaoRoutes from "./routes/programacaoRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// __dirname em ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 MIDDLEWARES IMPORTANTES
app.use(cors({
  origin: "*", // em produção pode restringir depois
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

// =====================
// ROTAS API
// =====================
app.use("/api/visitantes", visitanteRoutes);
app.use("/api/aceitaramJesus", aceitaramJesusRoutes);
app.use("/api/avisos", avisoRoutes);
app.use("/api/programacoes", programacaoRoutes);
app.use("/api/auth", authRoutes);

// =====================
// TESTE API
// =====================
app.get("/", (req, res) => {
  res.json({ message: "🚀 API rodando com sucesso!" });
});

// =====================
// FRONTEND (React build)
// =====================
const frontendPath = path.join(__dirname, "../frontend/dist");

// Só serve se existir build
if (require("fs").existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  // fallback React SPA
  app.get("*", (req, res) => {
    // não intercepta API
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "API route not found" });
    }

    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// =====================
// PORTA (Render)
// =====================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});