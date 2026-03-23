import { FileText, Sparkles, Star, Eye } from "lucide-react";

interface DashboardStats {
  postsThisMonth: number;
  captionsThisMonth: number;
  reviewsThisMonth: number;
  totalViews: number;
  totalShares: number;
  totalDownloads: number;
}

export function StatsBar({ stats }: { stats: DashboardStats }) {
  const totalEngagement = stats.totalViews + stats.totalShares + stats.totalDownloads;

  const items = [
    {
      label: "Posts this month",
      value: stats.postsThisMonth,
      icon: FileText,
    },
    {
      label: "AI captions",
      value: stats.captionsThisMonth,
      icon: Sparkles,
    },
    {
      label: "Review requests",
      value: stats.reviewsThisMonth,
      icon: Star,
    },
    {
      label: "Total engagement",
      value: totalEngagement,
      icon: Eye,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-4 bg-card p-5">
          <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {item.value}
            </p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
