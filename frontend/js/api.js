// ============================================
// frontend/js/api.js
// Capa de comunicación con el backend REST
// ============================================

const BASE = "/api";

async function request(ruta, opciones = {}) {
  const res = await fetch(`${BASE}${ruta}`, {
    headers: { "Content-Type": "application/json" },
    ...opciones,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // respuesta sin cuerpo JSON
  }

  if (!res.ok) {
    throw new Error(data?.mensaje || `Error HTTP ${res.status}`);
  }
  return data;
}

// ---------- Categorías ----------
export const apiCategorias = {
  listar: () => request("/categorias"),
  crear: (datos) => request("/categorias", { method: "POST", body: JSON.stringify(datos) }),
  actualizar: (id, datos) => request(`/categorias/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
  eliminar: (id) => request(`/categorias/${id}`, { method: "DELETE" }),
};

// ---------- Menús ----------
export const apiMenus = {
  listar: () => request("/menus"),
  crear: (datos) => request("/menus", { method: "POST", body: JSON.stringify(datos) }),
  actualizar: (id, datos) => request(`/menus/${id}`, { method: "PUT", body: JSON.stringify(datos) }),
  eliminar: (id) => request(`/menus/${id}`, { method: "DELETE" }),
};

// ---------- Pedidos ----------
export const apiPedidos = {
  listar: () => request("/pedidos"),
  crear: (datos) => request("/pedidos", { method: "POST", body: JSON.stringify(datos) }),
  actualizarEstado: (id, estado) => request(`/pedidos/${id}`, { method: "PUT", body: JSON.stringify({ estado }) }),
  eliminar: (id) => request(`/pedidos/${id}`, { method: "DELETE" }),
};
