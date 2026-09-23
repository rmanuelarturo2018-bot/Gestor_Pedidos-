import Order from "../models/Order.js";
import Menu from "../models/Menu.js";

const ESTADOS_VALIDOS = ["en preparación", "listo", "entregado", "cancelado"];

// GET /api/pedidos - Obtener todos los pedidos (populate: nombre y precio de menús)
export const obtenerPedidos = async (req, res) => {
  try {
    const pedidos = await Order.find()
      .populate("menus", "nombre precio")
      .sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener pedidos", error: error.message });
  }
};

// POST /api/pedidos - Crear un nuevo pedido (estado "pendiente" por defecto)
export const crearPedido = async (req, res) => {
  try {
    const { menus } = req.body;

    if (!menus || !Array.isArray(menus) || menus.length === 0) {
      return res.status(400).json({
        mensaje: "Debe proporcionar una lista de IDs de menús válidos",
      });
    }

    // Verificar que todos los IDs de menú existan
    const menusExistentes = await Menu.find({ _id: { $in: menus } });
    if (menusExistentes.length !== menus.length) {
      const menusEncontrados = menusExistentes.map((m) => m._id.toString());
      const menusFaltantes = menus.filter((id) => !menusEncontrados.includes(id));
      return res.status(400).json({
        mensaje: "Algunos menús no fueron encontrados",
        menusFaltantes,
      });
    }

    const pedido = await Order.create({ menus });
    const pedidoPopulado = await pedido.populate("menus", "nombre precio");

    res.status(201).json(pedidoPopulado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear pedido", error: error.message });
  }
};

// PUT /api/pedidos/:id - Actualizar el estado del pedido
export const actualizarPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ mensaje: "El campo 'estado' es obligatorio" });
    }

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        mensaje: `Estado no válido. Estados permitidos: ${ESTADOS_VALIDOS.join(", ")}`,
      });
    }

    const pedido = await Order.findById(id);
    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    // Regla: no se puede modificar un pedido ya entregado o cancelado
    if (["entregado", "cancelado"].includes(pedido.estado)) {
      return res.status(400).json({
        mensaje: `No se puede modificar un pedido con estado "${pedido.estado}"`,
      });
    }

    const pedidoActualizado = await Order.findByIdAndUpdate(
      id,
      { estado },
      { new: true, runValidators: true }
    ).populate("menus", "nombre precio");

    res.json(pedidoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar pedido", error: error.message });
  }
};

// DELETE /api/pedidos/:id - Eliminar un pedido
export const eliminarPedido = async (req, res) => {
  try {
    const { id } = req.params;

    const pedido = await Order.findById(id);
    if (!pedido) {
      return res.status(404).json({ mensaje: "Pedido no encontrado" });
    }

    await Order.findByIdAndDelete(id);
    res.json({ mensaje: "Pedido eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar pedido", error: error.message });
  }
};
