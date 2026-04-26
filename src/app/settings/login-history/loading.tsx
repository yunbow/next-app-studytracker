import { Skeleton } from "@/components/ui/skeleton";

export default function LoginHistoryLoading() {
  return (
    <div className="w-full max-w-2xl pb-6 space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-36" />

      <div className="rounded-lg border">
        <div className="p-6 border-b">
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 py-3 border-b last:border-b-0">
              <Skeleton className="h-5 w-5 rounded mt-0.5" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-44" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
