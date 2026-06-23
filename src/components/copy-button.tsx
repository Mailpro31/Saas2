"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ButtonProps = React.ComponentProps<typeof Button>;

export function CopyButton({
  text,
  label = "Copier",
  copiedLabel = "Copié",
  variant = "default",
  size = "default",
  className,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copié dans le presse-papier !");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Impossible de copier. Copiez manuellement.");
    }
  }

  return (
    <Button
      type="button"
      onClick={copy}
      variant={variant}
      size={size}
      className={className}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {size === "icon" ? null : copied ? copiedLabel : label}
    </Button>
  );
}
