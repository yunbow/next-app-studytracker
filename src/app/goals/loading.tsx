import { Skeleton } from "@/components/ui/skeleton";

export default function GoalsLoading() {
  return (
    <div className="w-full max-w-4xl pb-6 space-y-4">
      <div className="flex gap-2 border-b pb-2">
        <Skeleton className="h-9 w-28 rounded-lg" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-lg border p-5 space-y-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
