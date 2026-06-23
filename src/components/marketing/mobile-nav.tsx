"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem asChild>
          <Link href="/#fonctionnalites">Fonctionnalités</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/#comment">Comment ça marche</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/tarifs">Tarifs</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/login">Connexion</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
