"use client";

interface UsageMeterProps {
  current: number;
  limit: number;
  label: string;
}

export function UsageMeter({ current, limit, label }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;
  const isHigh = percentage > 80;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`tabular-nums font-medium ${isHigh ? "text-destructive" : "text-foreground"}`}>
          {current} / {limit}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-500 ${isHigh ? "bg-destructive" : "bg-foreground/20"}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
