import { FileText, Eye, Share2, Download } from "lucide-react";

interface StatsOverviewProps {
  totals: {
    totalPosts: number;
    totalViews: number;
    totalShares: number;
    totalDownloads: number;
  };
  thisMonth: {
    postsThisMonth: number;
    viewsThisMonth: number;
    sharesThisMonth: number;
    downloadsThisMonth: number;
  };
}

export function StatsOverview({ totals, thisMonth }: StatsOverviewProps) {
  const items = [
    {
      label: "Total posts",
      value: totals.totalPosts,
      subLabel: `${thisMonth.postsThisMonth} this month`,
      icon: FileText,
    },
    {
      label: "Total views",
      value: totals.totalViews,
      subLabel: `${thisMonth.viewsThisMonth} this month`,
      icon: Eye,
    },
    {
      label: "Total shares",
      value: totals.totalShares,
      subLabel: `${thisMonth.sharesThisMonth} this month`,
      icon: Share2,
    },
    {
      label: "Total downloads",
      value: totals.totalDownloads,
      subLabel: `${thisMonth.downloadsThisMonth} this month`,
      icon: Download,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border/60 bg-border/60 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-card p-5">
          <div className="flex items-center gap-3">
            <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
          <p className="mt-2 text-2xl font-semibold tabular-nums tracking-tight">
            {item.value.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{item.subLabel}</p>
        </div>
      ))}
    </div>
  );
}
