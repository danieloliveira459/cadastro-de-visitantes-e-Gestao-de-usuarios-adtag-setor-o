import express from "express";
import {
  listarSemanas,
  dadosDaSemana,
  relatorioMensal,
} from "../controllers/semanaController.js";

const router = express.Router();

// IMPORTANTE: a rota estática "/relatorio-mensal" deve vir ANTES da rota dinâmica "/:semana/dados"
// pois caso contrário o Express interpreta "relatorio-mensal" como parâmetro :semana.

router.get("/relatorio-mensal", relatorioMensal);   // GET /api/semanas/relatorio-mensal?mes=4&ano=2026
router.get("/",                 listarSemanas);      // GET /api/semanas
router.get("/:semana/dados",    dadosDaSemana);      // GET /api/semanas/2026-04-21/dados

export default router;
