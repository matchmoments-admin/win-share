import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Share2,
  Download,
  Trash2,
  Building2,
  Palette,
  Star,
  CreditCard,
} from "lucide-react";

type ActivityType =
  | "post_created"
  | "post_shared"
  | "post_downloaded"
  | "post_deleted"
  | "brand_updated"
  | "template_created"
  | "review_request_sent"
  | "subscription_changed";

interface Activity {
  id: string;
  type: ActivityType;
  description: string | null;
  resourceId: string | null;
  createdAt: Date;
  userFirstName: string | null;
  userLastName: string | null;
  userAvatarUrl: string | null;
}

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { icon: React.ElementType; color: string; label: string }
> = {
  post_created: { icon: FileText, color: "bg-blue-100 text-blue-600", label: "Post Created" },
  post_shared: { icon: Share2, color: "bg-green-100 text-green-600", label: "Post Shared" },
  post_downloaded: { icon: Download, color: "bg-indigo-100 text-indigo-600", label: "Downloaded" },
  post_deleted: { icon: Trash2, color: "bg-red-100 text-red-600", label: "Post Deleted" },
  brand_updated: { icon: Building2, color: "bg-amber-100 text-amber-600", label: "Brand Updated" },
  template_created: { icon: Palette, color: "bg-purple-100 text-purple-600", label: "Template Created" },
  review_request_sent: { icon: Star, color: "bg-yellow-100 text-yellow-600", label: "Review Sent" },
  subscription_changed: { icon: CreditCard, color: "bg-teal-100 text-teal-600", label: "Plan Changed" },
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export function RecentActivity({ activities }: { activities: Activity[] }) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No activity yet. Create your first post to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.type];
            const Icon = config.icon;
            const userName = [activity.userFirstName, activity.userLastName]
              .filter(Boolean)
              .join(" ") || "Someone";

            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{userName}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {config.label}
                    </Badge>
                  </div>
                  {activity.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-muted-foreground/70">
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
