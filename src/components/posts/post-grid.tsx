"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useRef, useEffect } from "react";
import { CATEGORIES } from "@/lib/templates/categories";
import { PostCard } from "@/components/posts/post-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Search,
  CheckSquare,
  X,
} from "lucide-react";
import { BulkActionBar } from "@/components/posts/bulk-action-bar";

interface PostImage {
  id: string;
  imageUrl: string;
  cdnUrl: string | null;
  platform: string;
}

interface Post {
  id: string;
  actionVerb: string;
  headline: string;
  category: string;
  viewCount: number;
  shareCount: number;
  downloadCount: number;
  createdAt: Date;
  images: PostImage[];
}

interface PostGridProps {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
  category?: string;
  sortBy?: string;
  search?: string;
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "most_shared", label: "Most Shared" },
  { value: "most_viewed", label: "Most Viewed" },
];

export function PostGrid({
  posts,
  total,
  page,
  pageSize,
  category,
  sortBy,
  search,
}: PostGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [postList, setPostList] = useState(posts);
  const [searchValue, setSearchValue] = useState(search ?? "");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = Math.ceil(total / pageSize);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  // Sync posts from server
  useEffect(() => {
    setPostList(posts);
  }, [posts]);

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset to page 1 when filters change
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`/posts?${params.toString()}`);
    },
    [router, searchParams]
  );

  function handleSearchChange(value: string) {
    setSearchValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ q: value || undefined });
    }, 300);
  }

  function handleDelete(postId: string) {
    setPostList((prev) => prev.filter((p) => p.id !== postId));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(postId);
      return next;
    });
  }

  function handleBulkDeleted(deletedIds: string[]) {
    setPostList((prev) => prev.filter((p) => !deletedIds.includes(p.id)));
    setSelectedIds(new Set());
    setSelectionMode(false);
    // Refresh server data to get accurate total count and pagination
    router.refresh();
  }

  function toggleSelect(postId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds(new Set());
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-[200px] pl-9"
            />
          </div>

          <Select
            value={category ?? "all"}
            onValueChange={(value) => updateParams({ category: value })}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {Object.values(CATEGORIES).map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={sortBy ?? "newest"}
            onValueChange={(value) => updateParams({ sort: value })}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            {total} post{total !== 1 ? "s" : ""} total
          </p>
          {postList.length > 0 && (
            <Button
              variant={selectionMode ? "secondary" : "outline"}
              size="sm"
              onClick={() =>
                selectionMode ? exitSelectionMode() : setSelectionMode(true)
              }
            >
              {selectionMode ? (
                <>
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <CheckSquare className="mr-1 h-4 w-4" />
                  Select
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {postList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 py-16 text-center">
          <LayoutGrid className="mb-4 h-10 w-10 text-muted-foreground/30" />
          <h3 className="text-base font-medium">No posts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? "No posts match your search. Try a different query."
              : "Create your first post to get started."}
          </p>
          {!search && (
            <Button className="mt-4" onClick={() => router.push("/create")}>
              Create Post
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {postList.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={handleDelete}
              selectionMode={selectionMode}
              isSelected={selectedIds.has(post.id)}
              onToggleSelect={toggleSelect}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={!hasPrevious}
            onClick={() =>
              updateParams({ page: String(page - 1) })
            }
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasNext}
            onClick={() =>
              updateParams({ page: String(page + 1) })
            }
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectionMode && selectedIds.size > 0 && (
        <BulkActionBar
          selectedIds={Array.from(selectedIds)}
          onDeleted={handleBulkDeleted}
          onCancel={exitSelectionMode}
        />
      )}
    </div>
  );
}
