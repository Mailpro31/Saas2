import "server-only";
import { Resend } from "resend";

/**
 * Transactional email via Resend. Reads its own env vars directly so it stays
 * decoupled from the rest of the config: if `RESEND_API_KEY` is absent, every
 * send becomes a logged no-op (the app keeps working without email).
 */
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.EMAIL_FROM ?? "Preuvio <onboarding@resend.dev>";

export async function sendNewTestimonialEmail(opts: {
  to: string;
  spaceName: string;
  authorName: string;
  excerpt: string;
  manageUrl: string;
}): Promise<void> {
  if (!apiKey) {
    console.info("[email] RESEND_API_KEY absent — notification ignorée (no-op).");
    return;
  }
  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: opts.to,
      subject: `Nouveau témoignage pour « ${opts.spaceName} » ✨`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:520px;margin:auto">
          <h2 style="margin:0 0 8px">Nouveau témoignage reçu</h2>
          <p style="color:#555;margin:0 0 16px">
            <strong>${escapeHtml(opts.authorName)}</strong> vient de laisser un témoignage
            sur votre espace <strong>${escapeHtml(opts.spaceName)}</strong>.
          </p>
          <blockquote style="border-left:3px solid #6366f1;margin:0 0 16px;padding:8px 16px;color:#333;background:#f8f8ff">
            ${escapeHtml(opts.excerpt)}
          </blockquote>
          <a href="${opts.manageUrl}"
             style="display:inline-block;background:#6366f1;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px">
            Modérer le témoignage
          </a>
        </div>`,
    });
  } catch (error) {
    console.error("[email] échec d'envoi de la notification:", error);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
