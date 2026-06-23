/**
 * Seed script — populates the database with a realistic demo account.
 * Run: pnpm db:seed   (loads .env.local, requires the Supabase service-role key)
 *
 * Idempotent: re-running resets the demo user's spaces and recreates them.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

if (!url || !serviceKey) {
  console.error(
    "❌ NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis (voir .env.example).",
  );
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_EMAIL = "demo@preuvio.app";
const DEMO_PASSWORD = "DemoPreuvio2026!";

type Seed = {
  name: string;
  role: string;
  rating: number;
  content: string;
  status: "approved" | "pending";
  featured?: boolean;
};

const TESTIMONIALS: Seed[] = [
  { name: "Sophie Lambert", role: "Coach business", rating: 5, status: "approved", featured: true, content: "Grâce à la formation, j'ai structuré mon offre et signé 3 clients en un mois. Un accompagnement clair et bienveillant." },
  { name: "Marc Dubois", role: "Fondateur, Studio Pixel", rating: 5, status: "approved", featured: true, content: "Exactement ce qu'il me fallait pour passer un cap. Les modules sont concrets et directement applicables." },
  { name: "Inès Caron", role: "Formatrice en ligne", rating: 5, status: "approved", content: "Le meilleur investissement de l'année. J'ai enfin une méthode pour vendre sans me sentir mal à l'aise." },
  { name: "Thomas Renaud", role: "Consultant SEO", rating: 4, status: "approved", content: "Beaucoup de valeur, des exemples réels et un suivi au top. Je recommande à tous les indépendants." },
  { name: "Awa Diallo", role: "Designer freelance", rating: 5, status: "approved", content: "J'appréhendais, mais tout est expliqué pas à pas. Résultat : mon chiffre d'affaires a doublé en un trimestre." },
  { name: "Julien Faure", role: "Indie hacker", rating: 5, status: "approved", content: "Pédagogie au top, communauté réactive. J'ai lancé mon premier produit en 6 semaines." },
  { name: "Camille Petit", role: "Rédactrice web", rating: 5, status: "approved", content: "Des conseils actionnables dès le premier jour. Mon positionnement est enfin clair." },
  { name: "Lucas Moreau", role: "Développeur indépendant", rating: 4, status: "approved", content: "Très complet. J'aurais aimé plus d'exemples sur la partie technique, mais l'ensemble est excellent." },
  { name: "Nadia Bensaïd", role: "Naturopathe", rating: 5, status: "approved", content: "Une vraie transformation dans ma manière de communiquer. Mes rendez-vous ont triplé." },
  { name: "Pierre Garnier", role: "Photographe", rating: 5, status: "approved", content: "Simple, efficace, sans bla-bla. Exactement le coup de pouce dont j'avais besoin." },
  { name: "Élodie Roux", role: "Cliente", rating: 5, status: "pending", content: "Je viens de terminer le programme, hâte de mettre tout ça en pratique. Merci pour la qualité !" },
  { name: "Karim Haddad", role: "E-commerçant", rating: 4, status: "pending", content: "Bon contenu dans l'ensemble, j'attends de voir les résultats sur le long terme." },
];

async function findOrCreateDemoUser(): Promise<string> {
  const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list?.users.find((u) => u.email === DEMO_EMAIL);
  if (existing) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: "Démo Preuvio" },
  });
  if (error || !data.user) throw new Error(`Création utilisateur démo: ${error?.message}`);
  return data.user.id;
}

async function main() {
  console.log("🌱 Seed Preuvio…");
  const userId = await findOrCreateDemoUser();

  // Ensure the profile exists (the trigger creates it) and set it to Pro.
  await admin
    .from("profiles")
    .upsert({ id: userId, email: DEMO_EMAIL, full_name: "Démo Preuvio", plan: "pro" });

  // Reset previous demo spaces (cascade removes testimonials + widgets).
  await admin.from("spaces").delete().eq("owner_id", userId);

  const { data: space, error: spaceErr } = await admin
    .from("spaces")
    .insert({
      owner_id: userId,
      name: "Ma formation Copywriting",
      slug: "formation-copywriting-demo",
      headline: "Partagez votre expérience 🙏",
      description: "Votre avis aide d'autres entrepreneurs à se lancer. Merci pour votre soutien !",
      brand_color: "#6366f1",
      collect_video: true,
    })
    .select("id, slug")
    .single();
  if (spaceErr || !space) throw new Error(`Création espace: ${spaceErr?.message}`);

  await admin.from("widgets").insert({ space_id: space.id, columns: 3, layout: "wall" });

  const now = Date.now();
  const rows = TESTIMONIALS.map((t, i) => ({
    space_id: space.id,
    author_name: t.name,
    author_role: t.role,
    rating: t.rating,
    content: t.content,
    status: t.status,
    featured: t.featured ?? false,
    consent: true,
    source: "form" as const,
    approved_at: t.status === "approved" ? new Date(now - i * 86400000).toISOString() : null,
    created_at: new Date(now - i * 86400000).toISOString(),
  }));
  const { error: tErr } = await admin.from("testimonials").insert(rows);
  if (tErr) throw new Error(`Insertion témoignages: ${tErr.message}`);

  console.log("\n✅ Seed terminé !");
  console.log("─────────────────────────────────────────");
  console.log(`👤 Compte démo : ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`📥 Collecte    : ${siteUrl}/c/${space.slug}`);
  console.log(`🧱 Mur public  : ${siteUrl}/mur/${space.slug}`);
  console.log(`📊 ${rows.length} témoignages (${rows.filter((r) => r.status === "approved").length} approuvés)`);
  console.log("─────────────────────────────────────────");
}

main().catch((e) => {
  console.error("❌ Seed échoué:", e);
  process.exit(1);
});
