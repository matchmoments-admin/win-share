import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { requireAuth } from "@/lib/auth";
import { getPostById } from "@/lib/db/queries/posts";
import { getPublicPostUrl } from "@/lib/sharing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Eye,
  Share2,
  Download as DownloadIcon,
  ExternalLink,
} from "lucide-react";
import { DownloadButton } from "@/components/sharing/download-button";
import { SharePanel } from "@/components/sharing/share-panel";
import { CaptionGenerator } from "@/components/sharing/caption-generator";
import { QrCodeGenerator } from "@/components/sharing/qr-code-generator";

const PLATFORM_LABELS: Record<string, string> = {
  instagram_feed: "Instagram Feed",
  instagram_story: "Instagram Story",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  twitter: "Twitter / X",
};

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatCategoryLabel(category: string) {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { orgId } = await requireAuth();

  const { id } = await params;
  const post = await getPostById(id);

  if (!post || post.organizationId !== orgId) {
    notFound();
  }

  const brandSnapshot = post.brandSnapshot?.[0];
  const companyName = brandSnapshot?.companyName ?? "Your Company";
  const publicUrl = getPublicPostUrl(post.slug);

  // Build field values as a record
  const fieldValues: Record<string, string> = {};
  if (post.fieldValues) {
    for (const fv of post.fieldValues) {
      fieldValues[fv.fieldName] = fv.fieldValue;
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/posts">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Just {post.actionVerb}!
            </h1>
            <p className="text-muted-foreground">{post.headline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href={publicUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="size-4" />
              View Public Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Post Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Category
              </p>
              <Badge variant="secondary">
                {formatCategoryLabel(post.category)}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Action Verb
              </p>
              <p className="text-sm font-medium">{post.actionVerb}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Created
              </p>
              <p className="flex items-center gap-1.5 text-sm">
                <Calendar className="size-3.5 text-muted-foreground" />
                {formatDate(post.createdAt)}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Status
              </p>
              <Badge
                variant={post.status === "published" ? "default" : "outline"}
              >
                {post.status}
              </Badge>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                <Eye className="size-4" />
                <span className="text-2xl font-bold text-foreground">
                  {post.viewCount}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Views</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                <Share2 className="size-4" />
                <span className="text-2xl font-bold text-foreground">
                  {post.shareCount}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Shares</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                <DownloadIcon className="size-4" />
                <span className="text-2xl font-bold text-foreground">
                  {post.downloadCount}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Downloads</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Images */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Generated Images</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {post.images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                <Image
                  src={image.cdnUrl ?? image.imageUrl}
                  alt={`${PLATFORM_LABELS[image.platform] ?? image.platform} variant`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {image.isWatermarked && (
                  <Badge
                    variant="destructive"
                    className="absolute right-2 top-2"
                  >
                    Watermarked
                  </Badge>
                )}
              </div>
              <CardContent className="flex items-center justify-between pt-4">
                <div>
                  <p className="text-sm font-medium">
                    {PLATFORM_LABELS[image.platform] ?? image.platform}
                  </p>
                  {image.width && image.height && (
                    <p className="text-xs text-muted-foreground">
                      {image.width} x {image.height}
                    </p>
                  )}
                </div>
                <DownloadButton
                  imageUrl={image.cdnUrl ?? image.imageUrl}
                  fileName={`${post.slug}-${image.platform}.${image.format}`}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Share Panel */}
      <Card>
        <CardContent className="pt-6">
          <SharePanel
            postId={post.id}
            postSlug={post.slug}
            headline={post.headline}
            companyName={companyName}
          />
        </CardContent>
      </Card>

      {/* Field Values */}
      {Object.keys(fieldValues).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Field Values Used</CardTitle>
            <CardDescription>
              The data that was used to generate this post.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(fieldValues).map(([name, value]) => (
                <div key={name} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {name
                      .split("_")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </p>
                  <p className="text-sm">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Caption Generator & QR Code */}
      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        <CaptionGenerator
          postData={{
            category: post.category,
            actionVerb: post.actionVerb,
            headline: post.headline,
            companyName,
            industry:
              fieldValues.industry ?? brandSnapshot?.tagline ?? "other",
            fieldValues,
          }}
        />
        <QrCodeGenerator url={publicUrl} />
      </div>
    </div>
  );
}
