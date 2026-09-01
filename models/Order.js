import mongoose from "mongoose";

const ESTADOS_PERMITIDOS = [
  "pendiente",
  "en preparación",
  "listo",
  "entregado",
  "cancelado",
];

const orderSchema = new mongoose.Schema(
  {
    menus: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Menu",
        required: [true, "Debe incluir al menos un menú en el pedido"],
      },
    ],
    estado: {
      type: String,
      enum: {
        values: ESTADOS_PERMITIDOS,
        message: "El estado '{VALUE}' no es válido. Estados permitidos: " +
          ESTADOS_PERMITIDOS.join(", "),
      },
      default: "pendiente",
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
