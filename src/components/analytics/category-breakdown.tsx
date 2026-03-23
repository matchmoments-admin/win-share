interface CategoryData {
  category: string;
  count: number;
  views: number;
  shares: number;
}

function formatCategory(raw: string): string {
  return raw
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function CategoryBreakdown({ data }: { data: CategoryData[] }) {
  if (data.length === 0) {
    return (
      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Posts by category
        </h3>
        <div className="rounded-lg border border-border/60 p-6">
          <p className="text-sm text-muted-foreground">
            No data to display yet.
          </p>
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div>
      <h3 className="mb-4 text-sm font-medium text-muted-foreground">
        Posts by category
      </h3>
      <div className="space-y-4 rounded-lg border border-border/60 p-5">
        {data.map((item) => {
          const percentage = (item.count / maxCount) * 100;

          return (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">
                  {formatCategory(item.category)}
                </span>
                <div className="flex items-center gap-3 text-xs tabular-nums text-muted-foreground">
                  <span>{item.count} posts</span>
                  <span>{item.views} views</span>
                  <span>{item.shares} shares</span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-foreground/20 transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
