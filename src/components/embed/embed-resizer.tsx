"use client";

import { useEffect } from "react";

/**
 * Posts the rendered height of `#preuvio-embed-root` to the parent window so
 * the host page's iframe (injected by embed.js) can auto-resize.
 */
export function EmbedResizer({ id }: { id: string }) {
  useEffect(() => {
    const el = document.getElementById("preuvio-embed-root");
    if (!el) return;

    const post = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      window.parent?.postMessage({ type: "preuvio:height", id, height }, "*");
    };

    post();
    const ro = new ResizeObserver(post);
    ro.observe(el);
    // Catch late-loading media (avatars/videos) that change the height after
    // first paint, in case ResizeObserver debounces the change.
    const timers = [100, 400, 1200].map((ms) => setTimeout(post, ms));
    window.addEventListener("load", post);
    return () => {
      ro.disconnect();
      timers.forEach(clearTimeout);
      window.removeEventListener("load", post);
    };
  }, [id]);

  return null;
}
