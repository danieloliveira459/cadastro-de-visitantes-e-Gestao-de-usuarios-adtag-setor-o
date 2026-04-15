import express from "express";
import {
  listarCrianca,
  criarCrianca,
  deletarCrianca
} from "../controllers/criancaController.js";

const router = express.Router();

router.get("/", listarCrianca);
router.post("/", criarCrianca);
router.delete("/:id", deletarCrianca);

export default router;