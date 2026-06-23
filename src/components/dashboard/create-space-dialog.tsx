"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import { createSpace } from "@/lib/actions/spaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CreateSpaceDialog({
  disabled,
  variant = "default",
  label = "Nouvel espace",
}: {
  disabled?: boolean;
  variant?: "default" | "outline";
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      const res = await createSpace({ name: name.trim() });
      if (res.ok) {
        toast.success("Espace créé !");
        setOpen(false);
        setName("");
        router.push(`/dashboard/${res.data.id}/settings`);
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} disabled={disabled}>
          <Plus className="size-4" /> {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Créer un espace de collecte</DialogTitle>
            <DialogDescription>
              Un espace regroupe les témoignages d&apos;un produit, d&apos;une
              offre ou d&apos;une marque.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="space-name">Nom de l&apos;espace</Label>
            <Input
              id="space-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ma formation Copywriting"
              maxLength={80}
              autoFocus
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Créer l&apos;espace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
