import express from "express";
import {
  listarHomens,
  criarHomen,
  deletarHomen
} from "../controllers/homensController.js";

const router = express.Router();

router.get("/", listarHomens);
router.post("/", criarHomen);
router.delete("/:id", deletarHomen);

export default router;