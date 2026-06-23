"use client";

export default function EmbedError() {
  // Minimal, unobtrusive fallback rendered inside the customer's iframe.
  return (
    <div
      id="preuvio-embed-root"
      className="p-3 text-center text-sm text-neutral-400"
    >
      Témoignages momentanément indisponibles.
    </div>
  );
}
