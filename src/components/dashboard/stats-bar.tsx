import {
  Card,
  CardContent,
} from "@/components/ui/card";
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
      label: "Posts This Month",
      value: stats.postsThisMonth,
      icon: FileText,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "AI Captions",
      value: stats.captionsThisMonth,
      icon: Sparkles,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Review Requests",
      value: stats.reviewsThisMonth,
      icon: Star,
      color: "text-amber-600 bg-amber-100",
    },
    {
      label: "Total Engagement",
      value: totalEngagement,
      icon: Eye,
      color: "text-green-600 bg-green-100",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center gap-4 pt-6">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${item.color}`}
            >
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
