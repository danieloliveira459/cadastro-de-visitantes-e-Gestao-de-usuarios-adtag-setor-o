import express from "express";
import {
  listarJovens,
  criarJovem,
  deletarJovem
} from "../controllers/jovensController.js";

const router = express.Router();

router.get("/", listarJovens);
router.post("/", criarJovem);
router.delete("/:id", deletarJovem);

export default router;