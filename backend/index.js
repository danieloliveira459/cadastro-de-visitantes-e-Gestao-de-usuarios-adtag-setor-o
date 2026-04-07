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

// __dirname (ESModules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================
// 🔐 SECURITY HEADERS (CSP)
// =========================
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

// =========================
// 🌐 CORS (USANDO MIDDLEWARE)
// =========================
const allowedOrigins = [
  "http://localhost:5173",
  "https://cadatro-de-visitantes-e-gest-o-de-ukhv.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

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
  res.json({ message: "API rodando com sucesso!" });
});

// =========================
// 🌍 FRONTEND (React)
// =========================
const frontendPath = path.join(__dirname, "../frontend/dist");

