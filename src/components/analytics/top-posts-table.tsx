import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Share2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopPost {
  id: string;
  actionVerb: string;
  headline: string;
  category: string;
  viewCount: number;
  shareCount: number;
  downloadCount: number;
}

export function TopPostsTable({ posts }: { posts: TopPost[] }) {
  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No posts yet. Create your first post to start tracking performance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 5 Posts by Engagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div
              key={post.id}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  Just {post.actionVerb}! &mdash; {post.headline}
                </p>
                <Badge variant="secondary" className="mt-1 text-[10px] capitalize">
                  {post.category.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {post.viewCount}
                </span>
                <span className="flex items-center gap-1">
                  <Share2 className="h-3 w-3" />
                  {post.shareCount}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {post.downloadCount}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
