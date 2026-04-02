import express from "express";
import {
  listarAceitaram,
  criarAceitou,
  deletarAceitou
} from "../controllers/aceitaramJesusController.js";

const router = express.Router();

router.get("/", listarAceitaram);
router.post("/", criarAceitou);
router.delete("/:id", deletarAceitou);

export default router;