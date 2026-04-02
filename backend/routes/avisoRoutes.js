import express from "express";
import {
    listarAvisos,
    criarAviso,
    deletarAviso
} from "../controllers/avisoController.js";

const router = express.Router();

router.get("/", listarAvisos);
router.post("/", criarAviso);
router.delete("/:id", deletarAviso);


export default router;