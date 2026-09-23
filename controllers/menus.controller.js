import Menu from "../models/Menu.js";
import Category from "../models/Category.js";

// GET /api/menus - Obtener todos los menús (con populate de categoría)
export const obtenerMenus = async (req, res) => {
  try {
    const menus = await Menu.find()
      .populate("categoria")
      .sort({ createdAt: -1 });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener menús", error: error.message });
  }
};

// POST /api/menus - Crear un nuevo menú (disponible por defecto)
export const crearMenu = async (req, res) => {
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
};

// PUT /api/menus/:id - Actualizar un menú (incluye activar/desactivar)
export const actualizarMenu = async (req, res) => {
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
};

// DELETE /api/menus/:id - Eliminar un menú
export const eliminarMenu = async (req, res) => {
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
};
