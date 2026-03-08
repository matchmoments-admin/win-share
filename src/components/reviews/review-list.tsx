"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface ReviewRequest {
  id: string;
  clientName: string | null;
  clientEmail: string | null;
  reviewPlatform: string;
  reviewUrl: string;
  status: string;
  createdAt: Date;
}

export function ReviewList({ requests }: { requests: ReviewRequest[] }) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No review requests yet. Create your first one above.
        </CardContent>
      </Card>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    sent: "bg-blue-100 text-blue-800",
    clicked: "bg-green-100 text-green-800",
    completed: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="space-y-3">
      {requests.map((req) => (
        <Card key={req.id}>
          <CardContent className="flex items-center justify-between py-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {req.clientName || "Unnamed Client"}
                </span>
                <Badge variant="outline" className="capitalize">
                  {req.reviewPlatform}
                </Badge>
                <Badge
                  className={statusColors[req.status] || "bg-gray-100 text-gray-800"}
                >
                  {req.status}
                </Badge>
              </div>
              {req.clientEmail && (
                <p className="text-sm text-muted-foreground">
                  {req.clientEmail}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Created{" "}
                {new Date(req.createdAt).toLocaleDateString("en-AU", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
            <a
              href={req.reviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Open
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
