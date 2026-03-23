"use client";

interface SidebarUsageProps {
  current: number;
  limit: number;
}

export function SidebarUsage({ current, limit }: SidebarUsageProps) {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const isHigh = percentage > 80;

  return (
    <div className="px-6 py-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Posts</span>
        <span className={`tabular-nums font-medium ${isHigh ? "text-destructive" : "text-muted-foreground"}`}>
          {current}/{limit}
        </span>
      </div>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isHigh ? "bg-destructive" : "bg-foreground/20"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
