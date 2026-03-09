"use client";

import { cn } from "@/lib/utils";

interface SidebarUsageProps {
  current: number;
  limit: number;
}

export function SidebarUsage({ current, limit }: SidebarUsageProps) {
  const percentage = limit > 0 ? Math.min((current / limit) * 100, 100) : 0;

  const barColor =
    percentage > 80
      ? "bg-red-500"
      : percentage > 50
        ? "bg-yellow-500"
        : "bg-emerald-500";

  const textColor =
    percentage > 80
      ? "text-red-400"
      : percentage > 50
        ? "text-yellow-400"
        : "text-emerald-400";

  return (
    <div className="px-6 py-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">Posts</span>
        <span className={cn("font-medium", textColor)}>
          {current}/{limit}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all duration-500", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
