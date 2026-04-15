import express from "express";
import {
  listarCadastroGeral,
  criarCadastroGeral,
  deletarCadastroGeral
} from "../controllers/cadastroGeralController.js";

const router = express.Router();

router.get("/", listarCadastroGeral);
router.post("/", criarCadastroGeral);
router.delete("/:id", deletarCadastroGeral);

export default router;