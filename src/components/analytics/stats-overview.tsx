import { Card, CardContent } from "@/components/ui/card";
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
      label: "Total Posts",
      value: totals.totalPosts,
      subLabel: `${thisMonth.postsThisMonth} this month`,
      icon: FileText,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Total Views",
      value: totals.totalViews,
      subLabel: `${thisMonth.viewsThisMonth} this month`,
      icon: Eye,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Total Shares",
      value: totals.totalShares,
      subLabel: `${thisMonth.sharesThisMonth} this month`,
      icon: Share2,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Total Downloads",
      value: totals.totalDownloads,
      subLabel: `${thisMonth.downloadsThisMonth} this month`,
      icon: Download,
      color: "text-amber-600 bg-amber-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${item.color}`}
              >
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-3xl font-bold">{item.value.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{item.subLabel}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
