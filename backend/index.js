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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// SECURITY HEADERS
app.use((req, res, next) => {
  res.setHeader(
  "Content-Security-Policy",
  `
  default-src 'self' https: data: blob:;
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' https: data: blob:;
  font-src 'self' https: data:;
  connect-src 'self' https:;
  `
);
  next();
});
//  CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://cadatro-de-visitantes-e-gest-o-de-ukhv.onrender.com",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("CORS bloqueado:", origin);
    return callback(null, false);
  },
  credentials: true,
}));

//  ESSA LINHA É CRUCIAL
app.options("*", cors());
//  MIDDLEWARE
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
//  FRONTEND (React)
const frontendPath = path.join(__dirname, "../frontend/dist");

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));

  app.get("*", (req, res, next) => {
    // NÃO interceptar API
    if (req.path.startsWith("/api")) {
      return next();
    }

    const indexFile = path.join(frontendPath, "index.html");

    if (fs.existsSync(indexFile)) {
      res.sendFile(indexFile);
    } else {
      res.status(500).send("Frontend não encontrado");
    }
  });
} else {
  console.warn("⚠️ Pasta dist não encontrada. Frontend não será servido.");
}
// 404 SOMENTE API
app.use("/api", (req, res) => {
  res.status(404).json({
    message: "Rota da API não encontrada",
  });
});
//  START
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(` Servidor rodando em http://localhost:${PORT}`);
});