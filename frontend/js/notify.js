// ============================================
// frontend/js/notify.js
// Sistema simple de notificaciones toast
// ============================================

export function notificar(mensaje, tipo = "exito") {
  // Eliminar notificación previa si existe
  document.querySelector(".notificacion")?.remove();

  const div = document.createElement("div");
  div.className = `notificacion ${tipo}`;
  div.textContent = mensaje;
  document.body.appendChild(div);

  setTimeout(() => div.remove(), 3000);
}

export function notificarError(error) {
  notificar(error?.message || "Ocurrió un error inesperado", "error");
}
