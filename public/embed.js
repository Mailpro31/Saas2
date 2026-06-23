/* Preuvio embed loader. Injects a responsive, auto-resizing iframe wherever a
   <div data-preuvio-widget="WIDGET_ID"></div> placeholder is found. */
(function () {
  var me = document.currentScript;
  var origin = "";
  try {
    origin = me ? new URL(me.src).origin : "";
  } catch {
    origin = "";
  }

  function mount(el) {
    var id = el.getAttribute("data-preuvio-widget");
    if (!id || el.getAttribute("data-preuvio-mounted")) return;
    el.setAttribute("data-preuvio-mounted", "1");

    var iframe = document.createElement("iframe");
    iframe.src = origin + "/embed/" + encodeURIComponent(id);
    iframe.title = "Témoignages clients";
    iframe.loading = "lazy";
    iframe.setAttribute("scrolling", "no");
    iframe.style.width = "100%";
    iframe.style.border = "0";
    iframe.style.overflow = "hidden";
    iframe.style.height = "400px";
    iframe.setAttribute("data-preuvio-id", id);
    el.appendChild(iframe);
  }

  function mountAll() {
    var nodes = document.querySelectorAll("[data-preuvio-widget]");
    for (var i = 0; i < nodes.length; i++) mount(nodes[i]);
  }

  window.addEventListener("message", function (e) {
    if (origin && e.origin !== origin) return;
    var d = e.data;
    if (!d || d.type !== "preuvio:height" || !d.id) return;
    var frames = document.querySelectorAll("iframe[data-preuvio-id]");
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].getAttribute("data-preuvio-id") === d.id) {
        frames[i].style.height = d.height + "px";
      }
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})();
