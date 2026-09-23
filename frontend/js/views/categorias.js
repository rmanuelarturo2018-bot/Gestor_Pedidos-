// ============================================
// frontend/js/views/categorias.js
// Vista: Gestión de categorías
// ============================================

import { apiCategorias } from "../api.js";
import { notificar, notificarError } from "../notify.js";

let categoriaEditando = null; // id de la categoría en edición (o null)

// ---------- Render principal ----------
export async function renderCategorias(contenedor) {
  categoriaEditando = null;
  contenedor.innerHTML = `
    <div class="section-header">
      <h2>🏷️ Gestión de Categorías</h2>
    </div>

    <div class="card">
      <form id="form-categoria">
        <div class="form-grid">
          <div class="form-group">
            <label for="cat-nombre">Nombre *</label>
            <input id="cat-nombre" type="text" placeholder="Ej: Pizzas" required />
          </div>
          <div class="form-group">
            <label for="cat-descripcion">Descripción</label>
            <input id="cat-descripcion" type="text" placeholder="Descripción opcional" />
          </div>
          <div class="form-group">
            <label>&nbsp;</label>
            <button type="submit" class="btn btn-primario" id="cat-btn-submit">➕ Crear categoría</button>
          </div>
        </div>
      </form>
    </div>

    <div id="cat-lista"><p class="cargando">Cargando categorías...</p></div>
  `;

  document.getElementById("form-categoria").addEventListener("submit", guardarCategoria);
  await cargarCategorias();
}

// ---------- Cargar listado ----------
async function cargarCategorias() {
  const lista = document.getElementById("cat-lista");
  try {
    const categorias = await apiCategorias.listar();

    if (!categorias.length) {
      lista.innerHTML = `<div class="table-wrap"><p class="vacio">No hay categorías aún. ¡Crea la primera! 🍕</p></div>`;
      return;
    }

    lista.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${categorias
              .map(
                (c) => `
              <tr>
                <td><strong>${c.nombre}</strong></td>
                <td>${c.descripcion || "—"}</td>
                <td>
                  <button class="btn btn-editar btn-sm" data-editar="${c._id}">✏️ Editar</button>
                  <button class="btn btn-eliminar btn-sm" data-eliminar="${c._id}">🗑️ Eliminar</button>
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
      btn.addEventListener("click", () => iniciarEdicion(btn.dataset.editar, categorias))
    );
    lista.querySelectorAll("[data-eliminar]").forEach((btn) =>
      btn.addEventListener("click", () => eliminarCategoria(btn.dataset.eliminar, btn.dataset.nombre))
    );
  } catch (error) {
    notificarError(error);
    lista.innerHTML = `<div class="table-wrap"><p class="vacio">No se pudieron cargar las categorías.</p></div>`;
  }
}

// ---------- Crear / actualizar ----------
async function guardarCategoria(e) {
  e.preventDefault();

  const nombre = document.getElementById("cat-nombre").value.trim();
  const descripcion = document.getElementById("cat-descripcion").value.trim();
  const datos = { nombre, descripcion };

  try {
    if (categoriaEditando) {
      await apiCategorias.actualizar(categoriaEditando, datos);
      notificar("Categoría actualizada correctamente");
    } else {
      await apiCategorias.crear(datos);
      notificar("Categoría creada correctamente");
    }

    cancelarEdicion();
    await cargarCategorias();
  } catch (error) {
    notificarError(error);
  }
}

// ---------- Edición ----------
function iniciarEdicion(id, categorias) {
  const categoria = categorias.find((c) => c._id === id);
  if (!categoria) return;

  categoriaEditando = id;
  document.getElementById("cat-nombre").value = categoria.nombre;
  document.getElementById("cat-descripcion").value = categoria.descripcion || "";
  document.getElementById("cat-btn-submit").textContent = "💾 Guardar cambios";

  document.getElementById("cat-nombre").focus();
}

function cancelarEdicion() {
  categoriaEditando = null;
  const form = document.getElementById("form-categoria");
  form?.reset();
  const btn = document.getElementById("cat-btn-submit");
  if (btn) btn.textContent = "➕ Crear categoría";
}

// ---------- Eliminar ----------
async function eliminarCategoria(id, nombre) {
  if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return;

  try {
    await apiCategorias.eliminar(id);
    notificar("Categoría eliminada correctamente");
    await cargarCategorias();
  } catch (error) {
    notificarError(error);
  }
}
