import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No data to display yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-green-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-pink-500",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Posts by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => {
            const percentage = (item.count / maxCount) * 100;
            const barColor = colors[index % colors.length];

            return (
              <div key={item.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {formatCategory(item.category)}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.count} posts</span>
                    <span>{item.views} views</span>
                    <span>{item.shares} shares</span>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
