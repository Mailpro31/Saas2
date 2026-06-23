"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Lock } from "lucide-react";
import Link from "next/link";
import { addManualTestimonial } from "@/lib/actions/testimonials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RatingInput } from "@/components/rating-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddManualDialog({
  spaceId,
  allowed,
}: {
  spaceId: string;
  allowed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!allowed) {
    return (
      <Button asChild variant="outline" size="sm">
        <Link href="/dashboard/billing">
          <Lock className="size-4" /> Ajout manuel (Pro)
        </Link>
      </Button>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await addManualTestimonial({
        spaceId,
        author_name: String(form.get("author_name") ?? ""),
        author_role: String(form.get("author_role") ?? ""),
        content: String(form.get("content") ?? ""),
        rating: rating || undefined,
      });
      if (res.ok) {
        toast.success("Témoignage ajouté et approuvé.");
        setOpen(false);
        setRating(0);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-4" /> Ajouter manuellement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Ajouter un témoignage</DialogTitle>
            <DialogDescription>
              Saisissez un témoignage reçu par email, DM ou ailleurs. Il sera
              ajouté comme approuvé.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="m-name">Nom *</Label>
                <Input id="m-name" name="author_name" required maxLength={120} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="m-role">Rôle / société</Label>
                <Input id="m-role" name="author_role" maxLength={120} placeholder="CEO, Acme" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Note</Label>
              <RatingInput value={rating} onChange={setRating} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-content">Témoignage *</Label>
              <Textarea id="m-content" name="content" required maxLength={2000} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Ajouter
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
