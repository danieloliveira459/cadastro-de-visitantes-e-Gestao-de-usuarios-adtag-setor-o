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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(cors());
app.use(express.json());
// ROTAS API
app.use("/api/visitantes", visitanteRoutes);
app.use("/api/aceitaramJesus", aceitaramJesusRoutes);
app.use("/api/avisos", avisoRoutes);
app.use("/api/programacoes", programacaoRoutes);
app.use("/api/auth", authRoutes);
// ROTA TESTE
app.get("/", (req, res) => {
  res.json({ message: "🚀 API rodando com sucesso!" });
});
// FRONTEND (BUILD REACT)
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));
// FALLBACK REACT (
app.get("*", (req, res) => {
  // evita quebrar API
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});
// PORTA (RENDER)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Servidor rodando na porta ${PORT}`);
});