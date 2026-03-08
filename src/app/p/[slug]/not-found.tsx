import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <h1 className="text-6xl font-bold tracking-tight text-gray-900">404</h1>
      <p className="mt-4 text-lg text-gray-600">
        This post doesn&apos;t exist or has been removed.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-6 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Go Home
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Create Your Own Post
        </Link>
      </div>
    </div>
  );
}
