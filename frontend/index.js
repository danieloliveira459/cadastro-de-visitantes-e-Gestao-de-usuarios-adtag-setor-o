import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import visitanteRoutes from "./routes/visitanteRoutes.js";
import aceitaramJesusRoutes from "./routes/aceitaramJesusRoutes.js";
import avisoRoutes from "./routes/avisoRoutes.js";
import programacaoRoutes from "./routes/programacaoRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

// Corrigir __dirname no ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
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
  res.send(" API rodando com sucesso!");
});

// SERVIR FRONTEND (React build)
const frontendPath = path.join(__dirname, "../frontend/dist");

app.use(express.static(frontendPath));

// CORREÇÃO DO ERRO AQUI (sem usar "*")
app.use((req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});
// PORTA (IMPORTANTE PARA RENDER)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Servidor rodando na porta ${PORT}`);
});