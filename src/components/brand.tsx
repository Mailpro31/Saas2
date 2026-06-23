import Link from "next/link";
import { MessageSquareQuote } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <MessageSquareQuote className="size-4" />
      </span>
      <span className="text-lg">Preuvio</span>
    </Link>
  );
}
