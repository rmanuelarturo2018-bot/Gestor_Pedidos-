import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del menú es obligatorio"],
      trim: true,
    },
    descripcion: {
      type: String,
      trim: true,
      default: "",
    },
    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"],
    },
    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "La categoría es obligatoria"],
    },
    disponible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Menu = mongoose.model("Menu", menuSchema);

export default Menu;
