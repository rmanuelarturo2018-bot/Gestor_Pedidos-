// ============================================
// frontend/js/app.js
// Entrypoint: navegación entre vistas (tabs)
// ============================================

import { renderCategorias } from "./views/categorias.js";
import { renderMenus } from "./views/menus.js";
import { renderPedidos } from "./views/pedidos.js";

const VISTAS = {
  menus: renderMenus,
  categorias: renderCategorias,
  pedidos: renderPedidos,
};

const contenedor = document.getElementById("app");
const tabs = document.querySelectorAll(".tab");

async function navegarA(vista) {
  const render = VISTAS[vista];
  if (!render) return;

  // Actualizar pestaña activa
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.view === vista));

  // Cargar la vista
  contenedor.innerHTML = `<p class="cargando">Cargando...</p>`;
  try {
    await render(contenedor);
  } catch (error) {
    contenedor.innerHTML = `
      <div class="card">
        <p class="vacio">⚠️ Error al cargar la vista: ${error.message}</p>
      </div>
    `;
  }
}

tabs.forEach((tab) => tab.addEventListener("click", () => navegarA(tab.dataset.view)));

// Vista inicial
navegarA("menus");
