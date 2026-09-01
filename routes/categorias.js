import { Router } from "express";
import Category from "../models/Category.js";

const router = Router();

// GET / - Obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const categorias = await Category.find().sort({ createdAt: -1 });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener categorías", error: error.message });
  }
});

// POST / - Crear una nueva categoría
router.post("/", async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ mensaje: "El nombre de la categoría es obligatorio" });
    }

    const categoriaExistente = await Category.findOne({ nombre });
    if (categoriaExistente) {
      return res.status(400).json({ mensaje: "Ya existe una categoría con ese nombre" });
    }

    const categoria = await Category.create({ nombre, descripcion });
    res.status(201).json(categoria);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear categoría", error: error.message });
  }
});

// PUT /:id - Actualizar una categoría
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;

    const categoria = await Category.findById(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    if (nombre && nombre !== categoria.nombre) {
      const existente = await Category.findOne({ nombre });
      if (existente) {
        return res.status(400).json({ mensaje: "Ya existe otra categoría con ese nombre" });
      }
    }

    const categoriaActualizada = await Category.findByIdAndUpdate(
      id,
      { nombre, descripcion },
      { new: true, runValidators: true }
    );

    res.json(categoriaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar categoría", error: error.message });
  }
});

// DELETE /:id - Eliminar una categoría
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Category.findById(id);
    if (!categoria) {
      return res.status(404).json({ mensaje: "Categoría no encontrada" });
    }

    await Category.findByIdAndDelete(id);
    res.json({ mensaje: "Categoría eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar categoría", error: error.message });
  }
});

export default router;
