"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface BulkActionBarProps {
  selectedIds: string[];
  onDeleted: (deletedIds: string[]) => void;
  onCancel: () => void;
}

async function downloadFile(url: string, index: number) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `winshare-post-${index + 1}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    // Skip individual file failures silently
  }
}

export function BulkActionBar({
  selectedIds,
  onDeleted,
  onCancel,
}: BulkActionBarProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleBulkDelete() {
    try {
      setIsDeleting(true);
      setError(null);
      const response = await fetch("/api/posts/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: selectedIds }),
      });

      if (response.ok) {
        setDeleteDialogOpen(false);
        onDeleted(selectedIds);
      } else {
        setError("Failed to delete posts. Please try again.");
      }
    } catch {
      setError("Failed to delete posts. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleBulkDownload() {
    try {
      setIsDownloading(true);
      setError(null);
      const response = await fetch("/api/posts/bulk-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: selectedIds }),
      });

      if (response.ok) {
        const { urls } = await response.json();
        // Fetch each image as blob to bypass cross-origin restrictions
        for (let i = 0; i < (urls as string[]).length; i++) {
          await downloadFile((urls as string[])[i], i);
          // Small delay between downloads to avoid browser throttling
          if (i < (urls as string[]).length - 1) {
            await new Promise((r) => setTimeout(r, 300));
          }
        }
      } else {
        setError("Failed to download posts. Please try again.");
      }
    } catch {
      setError("Failed to download posts. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t bg-background p-4 shadow-lg">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        <div>
          <span className="text-sm font-medium">
            {selectedIds.length} post{selectedIds.length !== 1 ? "s" : ""} selected
          </span>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-1 h-4 w-4" />
            )}
            Download
          </Button>

          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete {selectedIds.length} Posts</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete {selectedIds.length} post
                  {selectedIds.length !== 1 ? "s" : ""}? This action cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
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
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete All"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
