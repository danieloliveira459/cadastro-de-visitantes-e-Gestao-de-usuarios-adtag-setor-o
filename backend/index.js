import express from "express";
import cors from "cors";

import visitanteRoutes from "./routes/visitanteRoutes.js";
import aceitaramJesusRoutes from "./routes/aceitaramJesusRoutes.js";
import avisoRoutes from "./routes/avisoRoutes.js";
import programacaoRoutes from "./routes/programacaoRoutes.js";
import authRoutes from "./routes/authRoutes.js"

const app = express();

app.use(cors());
app.use(express.json());

// ROTAS
app.use("/visitantes", visitanteRoutes);
app.use("/aceitaramJesus", aceitaramJesusRoutes);
app.use("/avisos", avisoRoutes);
app.use("/programacoes", programacaoRoutes);
app.use("/auth", authRoutes);


app.listen(3000, () => {
  console.log(" Servidor rodando na porta 3000");
});