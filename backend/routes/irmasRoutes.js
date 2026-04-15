import express from "express";
import {
  listarIrmas,
  criarIrma,
  deletarIrma
} from "../controllers/irmaController.js";

const router = express.Router();

router.get("/", listarIrmas);
router.post("/", criarIrma);
router.delete("/:id", deletarIrma);

export default router;