"use client";

import Link from "next/link";
import { CreditCard, LogOut, Settings, User } from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function UserMenu({
  email,
  plan,
}: {
  email: string;
  plan: "free" | "pro";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Menu du compte"
      >
        <Avatar className="size-8">
          <AvatarFallback className="text-xs">
            {email.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate text-sm font-medium">{email}</span>
          <span className="text-xs font-normal text-muted-foreground">
            Plan {plan === "pro" ? "Pro" : "Gratuit"}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <User className="size-4" /> Mes espaces
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/billing">
            <CreditCard className="size-4" /> Facturation
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings className="size-4" /> Compte
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full">
              <LogOut className="size-4" /> Déconnexion
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
