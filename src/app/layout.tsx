import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Preuvio — La preuve sociale, en français",
    template: "%s · Preuvio",
  },
  description:
    "Collectez des témoignages clients (texte & vidéo) et affichez-les partout avec un mur embeddable. Simple, en français, conforme RGPD.",
  keywords: [
    "témoignages clients",
    "preuve sociale",
    "avis clients",
    "wall of love",
    "widget témoignages",
    "RGPD",
  ],
  authors: [{ name: "Preuvio" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Preuvio",
    title: "Preuvio — La preuve sociale, en français",
    description:
      "Collectez des témoignages clients et affichez-les partout. Texte & vidéo. Conforme RGPD.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Preuvio — La preuve sociale, en français",
    description:
      "Collectez des témoignages clients et affichez-les partout. Texte & vidéo. Conforme RGPD.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
