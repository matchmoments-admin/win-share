"use client";

import { cn } from "@/lib/utils";

interface UsageMeterProps {
  current: number;
  limit: number;
  label: string;
}

export function UsageMeter({ current, limit, label }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;

  const barColor =
    percentage > 80
      ? "bg-red-500"
      : percentage > 50
        ? "bg-yellow-500"
        : "bg-green-500";

  const textColor =
    percentage > 80
      ? "text-red-600"
      : percentage > 50
        ? "text-yellow-600"
        : "text-green-600";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className={cn("font-semibold", textColor)}>
          {current} of {limit} used
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
