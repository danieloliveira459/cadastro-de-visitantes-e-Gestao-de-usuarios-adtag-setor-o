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

import cadastroGeralRoutes from "./routes/cadastroGeralRoutes.js";
import criancasRoutes from "./routes/criancasRoutes.js";
import jovensRoutes from "./routes/jovensRoutes.js";
import mulheresRoutes from "./routes/mulheresRoutes.js";
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

// ✅ Limite aumentado para 20mb para suportar fotos em base64
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* ================= ROTAS API ================= */

app.use("/api/visitantes", visitanteRoutes);
app.use("/api/aceitaram-jesus", aceitaramJesusRoutes);
app.use("/api/avisos", avisoRoutes);
app.use("/api/programacoes", programacaoRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/cadastro-geral", cadastroGeralRoutes);
app.use("/api/criancas", criancasRoutes);
app.use("/api/jovens", jovensRoutes);
app.use("/api/mulheres", mulheresRoutes);
app.use("/api/homens", homensRoutes);

app.get("/api", (req, res) => {
  res.json({ message: "API rodando com sucesso!" });
});

/* ================= FRONTEND (SPA) ================= */

const frontendPath = path.join(__dirname, "../frontend/dist");

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
  console.log("✅ Servindo frontend estático de:", frontendPath);
} else {
  console.warn(
    "⚠️ frontend/dist não encontrado. Rode 'npm run build' no frontend."
  );
}

/* ================= FALLBACK SPA ================= */

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "Rota da API não encontrada" });
  }

  if (
    req.path.startsWith("/assets") ||
    req.path.endsWith(".js") ||
    req.path.endsWith(".css") ||
    req.path.endsWith(".png") ||
    req.path.endsWith(".jpg") ||
    req.path.endsWith(".jpeg") ||
    req.path.endsWith(".svg") ||
    req.path.endsWith(".pdf") ||
    req.path.endsWith(".ico") ||
    req.path.endsWith(".webp")
  ) {
    return res.status(404).end();
  }

  const indexPath = path.join(frontendPath, "index.html");

  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }

  return res.status(200).send(`
    <h2>Frontend não encontrado</h2>
    <p>Execute <code>npm run build</code> no frontend e faça o deploy novamente.</p>
  `);
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;
