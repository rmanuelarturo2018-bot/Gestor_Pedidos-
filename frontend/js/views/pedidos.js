// ============================================
// frontend/js/views/pedidos.js
// Vista: Gestión de pedidos (crear pedido,
// listar para cocina, cambiar estado, eliminar)
// ============================================

import { apiPedidos, apiMenus } from "../api.js";
import { notificar, notificarError } from "../notify.js";

let itemsPedido = []; // carrito: array de IDs de menú seleccionados

// Estados del pedido y sus etiquetas visuales
const ESTADOS = ["pendiente", "en preparación", "listo", "entregado", "cancelado"];

// ---------- Render principal ----------
export async function renderPedidos(contenedor) {
  itemsPedido = [];

  contenedor.innerHTML = `
    <div class="section-header">
      <h2>🧾 Gestión de Pedidos</h2>
      <button id="btn-recargar" class="btn btn-editar btn-sm">🔄 Recargar</button>
    </div>

    <div class="card">
      <h3>🆕 Nuevo pedido</h3>
      <p class="hint">El pedido se crea con estado <strong>"pendiente"</strong>.</p>

      <div class="form-group">
        <label for="pedido-menu">Elegir menú o plato</label>
        <div class="fila-agregar">
          <select id="pedido-menu">
            <option value="">Cargando menús...</option>
          </select>
          <button id="btn-agregar" class="btn btn-primario" type="button">➕ Añadir al pedido</button>
        </div>
      </div>

      <ul id="pedido-items" class="pedido-items"></ul>

      <button id="btn-crear-pedido" class="btn btn-primario" type="button" disabled>
        🧾 Crear pedido
      </button>
    </div>

    <h3 class="subtitulo-lista">📋 Pedidos (vista cocina)</h3>
    <div id="pedido-lista"><p class="cargando">Cargando pedidos...</p></div>
  `;

  document.getElementById("btn-agregar").addEventListener("click", agregarItem);
  document.getElementById("btn-crear-pedido").addEventListener("click", crearPedido);
  document.getElementById("btn-recargar").addEventListener("click", cargarPedidos);

  await cargarMenusEnSelect();
  await cargarPedidos();
}

// ---------- Cargar menús disponibles en el select ----------
async function cargarMenusEnSelect() {
  const select = document.getElementById("pedido-menu");
  try {
    const menus = await apiMenus.listar();
    const disponibles = menus.filter((m) => m.disponible);

    if (!disponibles.length) {
      select.innerHTML = `<option value="">⚠️ No hay menús disponibles</option>`;
      return;
    }

    select.innerHTML =
      `<option value="">Selecciona un menú...</option>` +
      disponibles
        .map((m) => `<option value="${m._id}">${m.nombre} — ${Number(m.precio).toFixed(2)} €</option>`)
        .join("");
  } catch {
    select.innerHTML = `<option value="">Error al cargar menús</option>`;
  }
}

// ---------- Carrito local ----------
function agregarItem() {
  const select = document.getElementById("pedido-menu");
  const id = select.value;

  if (!id) {
    notificar("Selecciona un menú primero", "error");
    return;
  }

  itemsPedido.push(id);
  pintarItems(select);
}

function quitarItem(index) {
  itemsPedido.splice(index, 1);
  pintarItems(document.getElementById("pedido-menu"));
}

function pintarItems(select) {
  const ul = document.getElementById("pedido-items");
  const btnCrear = document.getElementById("btn-crear-pedido");

  if (!itemsPedido.length) {
    ul.innerHTML = `<li class="item-vacio">Aún no has añadido platos al pedido.</li>`;
    btnCrear.disabled = true;
    return;
  }

  ul.innerHTML = itemsPedido
    .map(
      (id, i) => {
        const opt = select.querySelector(`option[value="${id}"]`);
        const etiqueta = opt ? opt.textContent : id;
        return `<li>🍽️ ${etiqueta} <button type="button" class="btn btn-eliminar btn-sm" data-quitar="${i}">✖</button></li>`;
      }
    )
    .join("");

  ul.querySelectorAll("[data-quitar]").forEach((btn) =>
    btn.addEventListener("click", () => quitarItem(Number(btn.dataset.quitar)))
  );

  btnCrear.disabled = false;
}

// ---------- Crear pedido ----------
async function crearPedido() {
  try {
    await apiPedidos.crear({ menus: itemsPedido });
    notificar("Pedido creado (estado: pendiente)");

    itemsPedido = [];
    pintarItems(document.getElementById("pedido-menu"));
    await cargarPedidos();
  } catch (error) {
    notificarError(error);
  }
}

// ---------- Listar pedidos ----------
async function cargarPedidos() {
  const lista = document.getElementById("pedido-lista");
  try {
    const pedidos = await apiPedidos.listar();

    if (!pedidos.length) {
      lista.innerHTML = `<div class="table-wrap"><p class="vacio">No hay pedidos todavía.</p></div>`;
      return;
    }

    lista.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Menús</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${pedidos
              .map((p, i) => {
                const total = (p.menus || []).reduce(
                  (suma, m) => suma + (Number(m.precio) || 0),
                  0
                );
                const fecha = new Date(p.createdAt).toLocaleString("es-ES");

                return `
                <tr>
                  <td>${i + 1}</td>
                  <td>${(p.menus || []).map((m) => m.nombre).join(", ") || "—"}</td>
                  <td>${total.toFixed(2)} €</td>
                  <td><span class="badge badge-${p.estado}">${p.estado}</span></td>
                  <td><small>${fecha}</small></td>
                  <td>
                    <select class="select-estado" data-id="${p._id}">
                      ${ESTADOS.map(
                        (e) =>
                          `<option value="${e}" ${e === p.estado ? "selected" : ""}>${e}</option>`
                      ).join("")}
                    </select>
                    <button class="btn btn-eliminar btn-sm" data-eliminar="${p._id}">🗑️</button>
                  </td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;

    lista.querySelectorAll(".select-estado").forEach((sel) =>
      sel.addEventListener("change", () => cambiarEstado(sel.dataset.id, sel.value))
    );
    lista.querySelectorAll("[data-eliminar]").forEach((btn) =>
      btn.addEventListener("click", () => eliminarPedido(btn.dataset.eliminar))
    );
  } catch (error) {
    notificarError(error);
    lista.innerHTML = `<div class="table-wrap"><p class="vacio">No se pudieron cargar los pedidos.</p></div>`;
  }
}

// ---------- Cambiar estado ----------
async function cambiarEstado(id, estado) {
  try {
    await apiPedidos.actualizarEstado(id, estado);
    notificar(`Pedido actualizado a "${estado}"`);
    await cargarPedidos();
  } catch (error) {
    notificarError(error);
    await cargarPedidos(); // revertir visualmente
  }
}

// ---------- Eliminar ----------
async function eliminarPedido(id) {
  if (!confirm("¿Eliminar este pedido?")) return;

  try {
    await apiPedidos.eliminar(id);
    notificar("Pedido eliminado correctamente");
    await cargarPedidos();
  } catch (error) {
    notificarError(error);
  }
}
