import { requireAuth } from "@/lib/auth";
import { listPosts } from "@/lib/db/queries/posts";
import { PostGrid } from "@/components/posts/post-grid";

const PAGE_SIZE = 12;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { orgId } = await requireAuth();

  const params = await searchParams;
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const sortBy =
    typeof params.sort === "string"
      ? (params.sort as "newest" | "most_shared" | "most_viewed")
      : "newest";
  const search =
    typeof params.q === "string" ? params.q : undefined;
  const page =
    typeof params.page === "string" ? Math.max(1, parseInt(params.page, 10)) : 1;

  const offset = (page - 1) * PAGE_SIZE;

  const { posts, total } = await listPosts(orgId, {
    category,
    sortBy,
    search,
    limit: PAGE_SIZE,
    offset,
  });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My posts</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse, share, and manage all your generated posts.
        </p>
      </div>

      <PostGrid
        posts={posts}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        category={category}
        sortBy={sortBy}
        search={search}
      />
    </div>
  );
}
