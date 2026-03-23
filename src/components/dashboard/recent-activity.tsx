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
  { icon: React.ElementType; label: string }
> = {
  post_created: { icon: FileText, label: "Post created" },
  post_shared: { icon: Share2, label: "Post shared" },
  post_downloaded: { icon: Download, label: "Downloaded" },
  post_deleted: { icon: Trash2, label: "Post deleted" },
  brand_updated: { icon: Building2, label: "Brand updated" },
  template_created: { icon: Palette, label: "Template created" },
  review_request_sent: { icon: Star, label: "Review sent" },
  subscription_changed: { icon: CreditCard, label: "Plan changed" },
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
      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Recent activity
        </h3>
        <div className="rounded-lg border border-border/60 p-6">
          <p className="text-sm text-muted-foreground">
            No activity yet. Create your first post to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Recent activity
      </h3>
      <div className="divide-y divide-border/60 rounded-lg border border-border/60">
        {activities.map((activity) => {
          const config = ACTIVITY_CONFIG[activity.type];
          const Icon = config.icon;
          const userName = [activity.userFirstName, activity.userLastName]
            .filter(Boolean)
            .join(" ") || "Someone";

          return (
            <div key={activity.id} className="flex items-center gap-3 px-4 py-3">
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm">
                  <span className="font-medium">{userName}</span>
                  <span className="mx-1.5 text-muted-foreground">&middot;</span>
                  <span className="text-muted-foreground">{config.label}</span>
                </p>
                {activity.description && (
                  <p className="line-clamp-1 text-xs text-muted-foreground">
                    {activity.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatTimeAgo(activity.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
