import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileSettingsLoading() {
  return (
    <div className="w-full max-w-2xl pb-8 space-y-4">
      <Skeleton className="h-4 w-24" />

      <div className="rounded-lg border">
        <div className="p-6 border-b">
          <Skeleton className="h-7 w-36" />
        </div>
        <div className="p-6 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          ))}
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
