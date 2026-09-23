// ============================================
// frontend/js/views/menus.js
// Vista: Gestión del menú (añadir, actualizar,
// desactivar y reactivar)
// ============================================

import { apiMenus, apiCategorias } from "../api.js";
import { notificar, notificarError } from "../notify.js";

let menuEditando = null; // id del menú en edición (o null)

// ---------- Render principal ----------
export async function renderMenus(contenedor) {
  menuEditando = null;

  contenedor.innerHTML = `
    <div class="section-header">
      <h2>📋 Gestión del Menú</h2>
      <button id="btn-recargar" class="btn btn-editar btn-sm">🔄 Recargar</button>
    </div>

    <div class="card">
      <form id="form-menu">
        <div class="form-grid">
          <div class="form-group">
            <label for="menu-nombre">Nombre *</label>
            <input id="menu-nombre" type="text" placeholder="Ej: Pizza Margarita" required />
          </div>
          <div class="form-group">
            <label for="menu-precio">Precio (€) *</label>
            <input id="menu-precio" type="number" min="0" step="0.01" placeholder="Ej: 9.50" required />
          </div>
          <div class="form-group">
            <label for="menu-categoria">Categoría *</label>
            <select id="menu-categoria" required>
              <option value="">Cargando categorías...</option>
            </select>
          </div>
          <div class="form-group full">
            <label for="menu-descripcion">Descripción</label>
            <input id="menu-descripcion" type="text" placeholder="Descripción opcional del plato" />
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <button type="submit" class="btn btn-primario" id="menu-btn-submit">➕ Añadir menú</button>
          </div>
        </div>
      </form>
    </div>

    <div id="menu-lista"><p class="cargando">Cargando menús...</p></div>
  `;

  document.getElementById("form-menu").addEventListener("submit", guardarMenu);
  document.getElementById("btn-recargar").addEventListener("click", cargarMenus);

  await cargarCategoriasEnSelect();
  await cargarMenus();
}

// ---------- Cargar categorías en el select ----------
async function cargarCategoriasEnSelect() {
  const select = document.getElementById("menu-categoria");
  try {
    const categorias = await apiCategorias.listar();

    if (!categorias.length) {
      select.innerHTML = `<option value="">⚠️ Primero crea una categoría</option>`;
      return;
    }

    select.innerHTML =
      `<option value="">Selecciona una categoría...</option>` +
      categorias.map((c) => `<option value="${c._id}">${c.nombre}</option>`).join("");
  } catch {
    select.innerHTML = `<option value="">Error al cargar categorías</option>`;
  }
}

// ---------- Cargar listado ----------
async function cargarMenus() {
  const lista = document.getElementById("menu-lista");
  try {
    const menus = await apiMenus.listar();

    if (!menus.length) {
      lista.innerHTML = `<div class="table-wrap"><p class="vacio">No hay menús aún. ¡Añade el primero! 🍔</p></div>`;
      return;
    }

    lista.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${menus
              .map(
                (m) => `
              <tr>
                <td>
                  <strong>${m.nombre}</strong><br/>
                  <small>${m.descripcion || ""}</small>
                </td>
                <td>${m.categoria?.nombre || "—"}</td>
                <td>${Number(m.precio).toFixed(2)} €</td>
                <td>
                  <span class="badge ${m.disponible ? "badge-disponible" : "badge-no-disponible"}">
                    ${m.disponible ? "Disponible" : "No disponible"}
                  </span>
                </td>
                <td>
                  <button class="btn btn-editar btn-sm" data-editar="${m._id}">✏️ Editar</button>
                  <button class="btn btn-accion btn-sm" data-toggle="${m._id}" data-valor="${!m.disponible}">
                    ${m.disponible ? "⏸️ Desactivar" : "▶️ Reactivar"}
                  </button>
                  <button class="btn btn-eliminar btn-sm" data-eliminar="${m._id}" data-nombre="${m.nombre}">🗑️</button>
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    lista.querySelectorAll("[data-editar]").forEach((btn) =>
      btn.addEventListener("click", () => iniciarEdicion(btn.dataset.editar, menus))
    );
    lista.querySelectorAll("[data-toggle]").forEach((btn) =>
      btn.addEventListener("click", () => alternarDisponibilidad(btn.dataset.toggle, btn.dataset.valor === "true"))
    );
    lista.querySelectorAll("[data-eliminar]").forEach((btn) =>
      btn.addEventListener("click", () => eliminarMenu(btn.dataset.eliminar, btn.dataset.nombre))
    );
  } catch (error) {
    notificarError(error);
    lista.innerHTML = `<div class="table-wrap"><p class="vacio">No se pudieron cargar los menús.</p></div>`;
  }
}

// ---------- Crear / actualizar ----------
async function guardarMenu(e) {
  e.preventDefault();

  const datos = {
    nombre: document.getElementById("menu-nombre").value.trim(),
    descripcion: document.getElementById("menu-descripcion").value.trim(),
    precio: Number(document.getElementById("menu-precio").value),
    categoria: document.getElementById("menu-categoria").value,
  };

  try {
    if (menuEditando) {
      await apiMenus.actualizar(menuEditando, datos);
      notificar("Menú actualizado correctamente");
    } else {
      await apiMenus.crear(datos);
      notificar("Menú creado correctamente (disponible por defecto)");
    }

    cancelarEdicion();
    await cargarMenus();
  } catch (error) {
    notificarError(error);
  }
}

// ---------- Activar / desactivar ----------
async function alternarDisponibilidad(id, nuevoValor) {
  try {
    await apiMenus.actualizar(id, { disponible: nuevoValor });
    notificar(nuevoValor ? "Menú reactivado" : "Menú desactivado");
    await cargarMenus();
  } catch (error) {
    notificarError(error);
  }
}

// ---------- Edición ----------
function iniciarEdicion(id, menus) {
  const menu = menus.find((m) => m._id === id);
  if (!menu) return;

  menuEditando = id;
  document.getElementById("menu-nombre").value = menu.nombre;
  document.getElementById("menu-descripcion").value = menu.descripcion || "";
  document.getElementById("menu-precio").value = menu.precio;
  document.getElementById("menu-categoria").value = menu.categoria?._id || "";
  document.getElementById("menu-btn-submit").textContent = "💾 Guardar cambios";

  document.getElementById("menu-nombre").focus();
}

function cancelarEdicion() {
  menuEditando = null;
  document.getElementById("form-menu")?.reset();
  const btn = document.getElementById("menu-btn-submit");
  if (btn) btn.textContent = "➕ Añadir menú";
}

// ---------- Eliminar ----------
async function eliminarMenu(id, nombre) {
  if (!confirm(`¿Eliminar el menú "${nombre}"?`)) return;

  try {
    await apiMenus.eliminar(id);
    notificar("Menú eliminado correctamente");
    await cargarMenus();
  } catch (error) {
    notificarError(error);
  }
}
