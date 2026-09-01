import { Router } from "express";
import Menu from "../models/Menu.js";
import Category from "../models/Category.js";

const router = Router();

// GET / - Obtener todos los menús (con populate de categoría)
router.get("/", async (req, res) => {
  try {
    const menus = await Menu.find()
      .populate("categoria")
      .sort({ createdAt: -1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener menús", error: error.message });
  }
});

// POST / - Crear un nuevo menú (disponible por defecto)
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria } = req.body;

    if (!nombre || !precio || !categoria) {
      return res.status(400).json({
        mensaje: "Los campos nombre, precio y categoría son obligatorios",
      });
    }

    const categoriaExiste = await Category.findById(categoria);
    if (!categoriaExiste) {
      return res.status(400).json({ mensaje: "La categoría especificada no existe" });
    }

    const menu = await Menu.create({ nombre, descripcion, precio, categoria });
    const menuPopulado = await menu.populate("categoria");

    res.status(201).json(menuPopulado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear menú", error: error.message });
  }
});

// PUT /:id - Actualizar un menú (incluyendo disponibilidad)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria, disponible } = req.body;

    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ mensaje: "Menú no encontrado" });
    }

    if (categoria) {
      const categoriaExiste = await Category.findById(categoria);
      if (!categoriaExiste) {
        return res.status(400).json({ mensaje: "La categoría especificada no existe" });
      }
    }

    const datosActualizados = {};
    if (nombre !== undefined) datosActualizados.nombre = nombre;
    if (descripcion !== undefined) datosActualizados.descripcion = descripcion;
    if (precio !== undefined) datosActualizados.precio = precio;
    if (categoria !== undefined) datosActualizados.categoria = categoria;
    if (disponible !== undefined) datosActualizados.disponible = disponible;

    const menuActualizado = await Menu.findByIdAndUpdate(id, datosActualizados, {
      new: true,
      runValidators: true,
    }).populate("categoria");

    res.json(menuActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar menú", error: error.message });
  }
});

// DELETE /:id - Eliminar un menú
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).json({ mensaje: "Menú no encontrado" });
    }

    await Menu.findByIdAndDelete(id);
    res.json({ mensaje: "Menú eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar menú", error: error.message });
  }
});

export default router;
