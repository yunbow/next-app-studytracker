import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type Props = {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ 
  title = "データがありません", 
  message = "まだ何も作成されていません。",
  actionLabel,
  actionHref
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
