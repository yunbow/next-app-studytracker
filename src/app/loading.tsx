export default function HomeLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header Skeleton */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
          <div className="flex gap-4">
            <div className="h-10 w-20 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </header>

      {/* Hero Section Skeleton */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="space-y-8 text-center">
            <div className="mx-auto h-12 w-3/4 animate-pulse rounded-lg bg-muted" />
            <div className="mx-auto h-6 w-1/2 animate-pulse rounded-lg bg-muted" />
            <div className="mx-auto h-12 w-40 animate-pulse rounded-lg bg-muted" />
          </div>

          {/* Features Grid Skeleton */}
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4 rounded-lg border p-6">
                <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
                <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
      </footer>
    </div>
  );
}
