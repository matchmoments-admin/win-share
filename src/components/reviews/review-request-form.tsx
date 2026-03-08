"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Star, Loader2 } from "lucide-react";
import { QrCodeGenerator } from "@/components/sharing/qr-code-generator";

const REVIEW_PLATFORMS = [
  { value: "google", label: "Google Business" },
  { value: "trustpilot", label: "Trustpilot" },
  { value: "facebook", label: "Facebook" },
  { value: "productreview", label: "ProductReview.com.au" },
];

export function ReviewRequestForm() {
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [reviewPlatform, setReviewPlatform] = useState("google");
  const [reviewUrl, setReviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedRequest, setGeneratedRequest] = useState<{
    reviewUrl: string;
    id: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reviewUrl) {
      toast.error("Please enter your review page URL");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/reviews/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName || undefined,
          clientEmail: clientEmail || undefined,
          reviewPlatform,
          reviewUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error?.message || "Failed to create request");
      }

      const data = await res.json();
      setGeneratedRequest({
        reviewUrl: data.reviewRequest.reviewUrl,
        id: data.reviewRequest.id,
      });
      toast.success("Review request created!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create request"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Create Review Request
          </CardTitle>
          <CardDescription>
            Generate a shareable link or QR code for clients to leave a review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name (optional)</Label>
              <Input
                id="clientName"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email (optional)</Label>
              <Input
                id="clientEmail"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Review Platform</Label>
              <Select value={reviewPlatform} onValueChange={setReviewPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REVIEW_PLATFORMS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewUrl">Your Review Page URL</Label>
              <Input
                id="reviewUrl"
                type="url"
                value={reviewUrl}
                onChange={(e) => setReviewUrl(e.target.value)}
                placeholder="https://g.page/r/your-business/review"
                required
              />
              <p className="text-xs text-muted-foreground">
                Paste the direct link to your review page on the selected
                platform.
              </p>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Review Request
            </Button>
          </form>
        </CardContent>
      </Card>

      {generatedRequest && (
        <Card>
          <CardHeader>
            <CardTitle>Share with Your Client</CardTitle>
            <CardDescription>
              Send this link or print the QR code for your client.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Review Link</Label>
              <div className="flex gap-2">
                <Input value={generatedRequest.reviewUrl} readOnly />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedRequest.reviewUrl);
                    toast.success("Link copied!");
                  }}
                >
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex justify-center">
              <QrCodeGenerator url={generatedRequest.reviewUrl} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
