import { Eye, Share2, Download } from "lucide-react";

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
      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Top posts
        </h3>
        <div className="rounded-lg border border-border/60 p-6">
          <p className="text-sm text-muted-foreground">
            No posts yet. Create your first post to start tracking performance.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Top 5 posts by engagement
      </h3>
      <div className="divide-y divide-border/60 rounded-lg border border-border/60">
        {posts.map((post, index) => (
          <div
            key={post.id}
            className="flex items-center gap-4 px-4 py-3"
          >
            <span className="w-5 shrink-0 text-center font-mono text-xs text-muted-foreground">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                Just {post.actionVerb} &mdash; {post.headline}
              </p>
              <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                {post.category.replace(/_/g, " ")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-4 text-xs tabular-nums text-muted-foreground">
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
    </div>
  );
}
