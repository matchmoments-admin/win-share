"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Eye,
  Download,
  Share2,
  Trash2,
  Loader2,
  ImageIcon,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PostImage {
  id: string;
  imageUrl: string;
  cdnUrl: string | null;
  platform: string;
}

interface PostCardProps {
  post: {
    id: string;
    actionVerb: string;
    headline: string;
    category: string;
    viewCount: number;
    shareCount: number;
    downloadCount: number;
    createdAt: Date;
    images: PostImage[];
  };
  onDelete?: (postId: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (postId: string) => void;
}

export function PostCard({
  post,
  onDelete,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
}: PostCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const thumbnail = post.images[0];
  const thumbnailSrc = thumbnail?.cdnUrl ?? thumbnail?.imageUrl;

  async function handleDelete() {
    try {
      setIsDeleting(true);
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        onDelete?.(post.id);
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/share/${post.id}`
      );
    } catch {
      // Fallback: silent fail
    }
  }

  function handleCardClick(e: React.MouseEvent) {
    if (selectionMode) {
      e.preventDefault();
      onToggleSelect?.(post.id);
    }
  }

  return (
    <Card
      className={cn(
        "group overflow-hidden transition-shadow hover:shadow-md",
        selectionMode && "cursor-pointer",
        isSelected && "ring-2 ring-primary"
      )}
      onClick={handleCardClick}
    >
      {/* Thumbnail */}
      <div className="relative">
        {selectionMode ? (
          <div className="block">
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
              {thumbnailSrc ? (
                <Image
                  src={thumbnailSrc}
                  alt={`Just ${post.actionVerb}! — ${post.headline}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute left-2 top-2">
                <Badge variant="secondary" className="text-xs capitalize">
                  {post.category.replace(/_/g, " ")}
                </Badge>
              </div>
              {/* Selection checkbox overlay */}
              <div className="absolute right-2 top-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded border-2 transition-colors",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-white/80 bg-white/60"
                  )}
                >
                  {isSelected && <Check className="h-4 w-4" />}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Link href={`/posts/${post.id}`} className="block">
            <div className="relative aspect-square w-full overflow-hidden bg-muted">
              {thumbnailSrc ? (
                <Image
                  src={thumbnailSrc}
                  alt={`Just ${post.actionVerb}! — ${post.headline}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                </div>
              )}
              <div className="absolute left-2 top-2">
                <Badge variant="secondary" className="text-xs capitalize">
                  {post.category.replace(/_/g, " ")}
                </Badge>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Content */}
      <CardContent className="space-y-1 pt-3">
        {selectionMode ? (
          <div>
            <h3 className="font-semibold leading-tight">
              Just {post.actionVerb}!
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {post.headline}
            </p>
          </div>
        ) : (
          <Link href={`/posts/${post.id}`} className="block">
            <h3 className="font-semibold leading-tight">
              Just {post.actionVerb}!
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {post.headline}
            </p>
          </Link>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
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
      </CardContent>

      {/* Quick Actions — hidden in selection mode */}
      {!selectionMode && (
        <CardFooter className="gap-1 pt-0">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link href={`/posts/${post.id}`}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">View</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon-sm" asChild>
            <a
              href={thumbnailSrc ?? "#"}
              download
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </a>
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="ml-auto text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Post</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete &quot;Just {post.actionVerb}! &mdash;{" "}
                  {post.headline}&quot;? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      )}
    </Card>
  );
}
