import express from "express";
import {
  listarProgramacoes,
  criarProgramacao,
  deletarProgramacao
} from "../controllers/programacaoController.js";

const router = express.Router();

router.get("/", listarProgramacoes);
router.post("/", criarProgramacao);
router.delete("/:id", deletarProgramacao);

export default router;