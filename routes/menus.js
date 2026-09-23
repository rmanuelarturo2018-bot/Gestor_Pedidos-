import { Router } from "express";
import {
  obtenerMenus,
  crearMenu,
  actualizarMenu,
  eliminarMenu,
} from "../controllers/menus.controller.js";

const router = Router();

router.get("/", obtenerMenus);
router.post("/", crearMenu);
router.put("/:id", actualizarMenu);
router.delete("/:id", eliminarMenu);

export default router;
