import { Skeleton } from "@/components/ui/skeleton";

export default function TimerLoading() {
  return (
    <div className="w-full max-w-2xl pb-6 space-y-6">
      <div className="flex flex-col items-center space-y-4 py-8">
        <Skeleton className="h-24 w-64 rounded-xl" />
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>

      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}
