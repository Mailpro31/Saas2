"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, LayoutGrid, Share2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export function SpaceTabs({ spaceId }: { spaceId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/${spaceId}`;

  const tabs = [
    { href: base, label: "Témoignages", icon: Inbox, exact: true },
    { href: `${base}/widgets`, label: "Widget", icon: LayoutGrid },
    { href: `${base}/share`, label: "Partager", icon: Share2 },
    { href: `${base}/settings`, label: "Réglages", icon: Settings },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto border-b" aria-label="Sections de l'espace">
      {tabs.map((tab) => {
        const active = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
