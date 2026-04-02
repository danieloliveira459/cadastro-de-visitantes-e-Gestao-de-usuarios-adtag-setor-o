import express from "express";
import {
  listarVisitantes,
  criarVisitante,
  deletarVisitante
} from "../controllers/visitanteController.js";

const router = express.Router();

router.get("/", listarVisitantes);
router.post("/", criarVisitante);
router.delete("/:id", deletarVisitante);

export default router;