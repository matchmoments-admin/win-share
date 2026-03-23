import { Skeleton } from "@/components/ui/skeleton";

export default function CreateLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <div className="space-y-6">
          {/* Category selector */}
          <div className="rounded-lg border border-border/60 p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-56" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </div>

          {/* Post details */}
          <div className="rounded-lg border border-border/60 p-6 space-y-4">
            <Skeleton className="h-5 w-28" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-9 w-full rounded-md" />
            </div>
          </div>

          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        {/* Preview */}
        <div className="lg:sticky lg:top-6">
          <div className="rounded-lg border border-border/60 p-6 space-y-4">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
