import { Router } from "express";
import {
  obtenerPedidos,
  crearPedido,
  actualizarPedido,
  eliminarPedido,
} from "../controllers/pedidos.controller.js";

const router = Router();

router.get("/", obtenerPedidos);
router.post("/", crearPedido);
router.put("/:id", actualizarPedido);
router.delete("/:id", eliminarPedido);

export default router;
