import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

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
// CORS CORRETO (PRODUÇÃO)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://cadatro-de-visitantes-e-gest-o-de-ukhv.onrender.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// MIDDLEWARE
app.use(express.json());
//  ROTAS API 
app.use("/api/visitantes", visitanteRoutes);
app.use("/api/aceitaramJesus", aceitaramJesusRoutes);
app.use("/api/avisos", avisoRoutes);
app.use("/api/programacoes", programacaoRoutes);
app.use("/api/auth", authRoutes);
// TESTE API
app.get("/api", (req, res) => {
  res.json({ message: "API rodando com sucesso!" });
});
// FRONTEND (React build)
const frontendPath = path.join(__dirname, "../frontend/dist");

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  //  CORREÇÃO IMPORTANTE:
  // NÃO interceptar rotas da API
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next(); // deixa API passar
    }

    res.sendFile(path.join(frontendPath, "index.html"));
  });
}
//  404 SOMENTE PARA API
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "Rota da API não encontrada",
  });
});
// PORTA
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Servidor rodando na porta ${PORT}`);
});