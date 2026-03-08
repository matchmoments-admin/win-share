import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getPostBySlug, incrementPostViewCount } from "@/lib/db/queries/posts";

interface PublicPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PublicPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const brandSnapshot = post.brandSnapshot?.[0];
  const companyName = brandSnapshot?.companyName ?? "WinPost";
  const title = `Just ${post.actionVerb}! — ${companyName}`;
  const description = post.headline;
  const ogImage = post.images?.[0]?.cdnUrl ?? post.images?.[0]?.imageUrl;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      ...(ogImage && {
        images: [
          {
            url: ogImage,
            width: post.images[0]?.width ?? 1200,
            height: post.images[0]?.height ?? 1200,
            alt: title,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function PublicPostPage({ params }: PublicPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Increment view count (fire-and-forget)
  incrementPostViewCount(slug).catch(() => {});

  const brandSnapshot = post.brandSnapshot?.[0];
  const companyName = brandSnapshot?.companyName ?? "";
  const primaryColor = brandSnapshot?.primaryColor ?? "#1e3a5f";
  const firstImage = post.images?.[0];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-6">
          {/* Celebration Header */}
          <div className="text-center">
            <p
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: primaryColor }}
            >
              {companyName}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Just {post.actionVerb}!
            </h1>
            <p className="mt-3 text-lg text-gray-600">{post.headline}</p>
          </div>

          {/* Image */}
          {firstImage && (
            <div className="overflow-hidden rounded-xl border bg-white shadow-lg">
              <div className="relative aspect-square">
                <Image
                  src={firstImage.cdnUrl ?? firstImage.imageUrl}
                  alt={`Just ${post.actionVerb}! — ${companyName}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, 512px"
                  priority
                />
              </div>
            </div>
          )}

          {/* Company & Tagline */}
          {(companyName || brandSnapshot?.tagline) && (
            <div className="text-center">
              {companyName && (
                <p className="text-sm font-medium text-gray-700">
                  {companyName}
                </p>
              )}
              {brandSnapshot?.tagline && (
                <p className="mt-0.5 text-xs text-gray-500">
                  {brandSnapshot.tagline}
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Viral Loop CTA */}
      <footer className="border-t bg-white px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
            Made with
          </p>
          <Link
            href="/"
            className="mt-1 inline-block text-xl font-bold tracking-tight text-gray-900 transition-colors hover:text-primary"
          >
            WinPost
          </Link>
          <p className="mt-2 text-sm text-gray-500">
            Create your own celebration post — Free
          </p>
          <Link
            href="/sign-up"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started for Free
          </Link>
        </div>
      </footer>
    </div>
  );
}
