import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ExternalLink } from "lucide-react";
import { requireSession } from "@/lib/auth";
import { getOwnedSpace } from "@/lib/queries";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function SharePage({
  params,
}: {
  params: Promise<{ spaceId: string }>;
}) {
  const { spaceId } = await params;
  const { user } = await requireSession();
  const space = await getOwnedSpace(spaceId, user.id);
  if (!space) notFound();

  const collectUrl = `${siteUrl}/c/${space.slug}`;
  const qr = await QRCode.toDataURL(collectUrl, {
    width: 240,
    margin: 1,
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Partagez votre page de collecte</CardTitle>
          <CardDescription>
            Envoyez ce lien à vos clients pour recueillir leurs témoignages.
            Aucun compte requis de leur côté.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input readOnly value={collectUrl} className="font-mono text-sm" />
            <div className="flex gap-2">
              <CopyButton text={collectUrl} label="Copier le lien" />
              <Button asChild variant="outline">
                <Link href={collectUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" /> Ouvrir
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-xl border bg-muted/30 p-6">
            <Image
              src={qr}
              alt="QR code de la page de collecte"
              width={180}
              height={180}
              className="rounded-lg bg-white p-2"
              unoptimized
            />
            <p className="text-center text-sm text-muted-foreground">
              Ou faites scanner ce QR code (idéal en présentiel ou sur un
              support imprimé).
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border bg-card p-5">
        <h3 className="text-sm font-semibold">💡 Conseils pour obtenir plus de témoignages</h3>
        <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
          <li>• Demandez juste après une réussite ou une livraison.</li>
          <li>• Ajoutez le lien dans votre signature email et vos factures.</li>
          <li>• Relancez une fois, gentiment, les clients satisfaits.</li>
        </ul>
      </div>
    </div>
  );
}
