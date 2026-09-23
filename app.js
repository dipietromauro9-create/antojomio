/* Antojo Mío — único JS del proyecto, solo para el formulario.
   Flujo: guarda en Netlify Forms (POST en 2.º plano) y abre
   WhatsApp con nombre + email + motivo + mensaje combinados.
   Sin JS, el form conserva su action a wa.me como fallback. */
(function () {
  "use strict";

  var WHATSAPP_NUMBER = "5492615980528";

  var form = document.querySelector('form[name="consulta-antojo-mio"]');

  // Menú móvil: al tocar un link se cierra el panel (el checkbox queda destildado)
  var navToggle = document.querySelector("#nav-toggle");
  if (navToggle) {
    document.querySelectorAll(".main-nav a").forEach(function (link) {
      link.addEventListener("click", function () {
        navToggle.checked = false;
      });
    });
  }

  if (!form) return;

  var status = form.querySelector(".form-status");
  var fechaInput = form.querySelector("#fecha");
  var mensajeInput = form.querySelector("#mensaje");
  var motivoInput = form.querySelector("#motivo");
  var nombreInput = form.querySelector("#nombre");

  // Fecha mínima = hoy (bloquea pasado), campo opcional
  if (fechaInput) {
    fechaInput.min = new Date().toISOString().split("T")[0];
  }

  // "Pedir →" de cada tarjeta pre-rellena motivo + mensaje (sin duplicar)
  document.querySelectorAll(".card-meta .link[data-producto]").forEach(function (link) {
    link.addEventListener("click", function () {
      var producto = link.getAttribute("data-producto");
      if (motivoInput) motivoInput.value = "pedido";
      if (mensajeInput) {
        var intro = "Hola, me interesa pedir: " + producto + ". ";
        if (mensajeInput.value.indexOf(producto) === -1) {
          mensajeInput.value = intro + mensajeInput.value;
        }
      }
      if (nombreInput) nombreInput.focus({ preventScroll: true });
    });
  });

  function say(msg) {
    if (status) status.textContent = msg;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var data = new FormData(form);
    if (data.get("empresa")) return; // honeypot: probable bot, salida silenciosa

    var nombre = (data.get("nombre") || "").toString().trim();
    var email = (data.get("email") || "").toString().trim();
    var motivo = (data.get("motivo") || "").toString().trim();
    var fecha = (data.get("fecha") || "").toString().trim();
    var mensaje = (data.get("mensaje") || "").toString().trim();
    if (!nombre || !email || !motivo || !mensaje) return; // el navegador ya valida required

    var texto =
      "Hola Antojo Mío, soy " + nombre + " (" + email + ").\n" +
      "Motivo: " + motivo + "\n" +
      (fecha ? "Fecha deseada: " + fecha.split("-").reverse().join("/") + "\n" : "") +
      "Consulta: " + mensaje;

    say("Guardando tu consulta y abriendo WhatsApp…");

    // 1) Guardado en Netlify Forms (solo funciona en producción; en local falla y se ignora)
    try {
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(data).toString()
      }).catch(function () { /* sin conexión o entorno local: WhatsApp igual abre */ });
    } catch (e) { /* navegadores sin fetch: WhatsApp igual abre */ }

    // 2) WhatsApp con todo combinado
    window.open(
      "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(texto),
      "_blank",
      "noopener"
    );

    say("¡Listo! Revisa WhatsApp y pulsa enviar para completar tu consulta.");
    form.reset();
  });
})();
