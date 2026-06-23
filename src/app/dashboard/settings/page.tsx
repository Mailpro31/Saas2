import type { Metadata } from "next";
import { requireSession } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Mon compte" };

export default async function AccountSettingsPage() {
  const { user, profile } = await requireSession();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mon compte</h1>
        <p className="text-sm text-muted-foreground">
          Vos informations personnelles.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <CardDescription>
            Pour modifier votre email ou mot de passe, contactez le support.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={user.email ?? ""} readOnly disabled />
          </div>
          {profile.full_name ? (
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input value={profile.full_name} readOnly disabled />
            </div>
          ) : null}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-sm text-muted-foreground">Plan actuel :</span>
            <Badge variant={profile.plan === "pro" ? "default" : "secondary"}>
              {profile.plan === "pro" ? "Pro" : "Gratuit"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
