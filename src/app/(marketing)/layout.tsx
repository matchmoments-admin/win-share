import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background">
              <span className="text-sm font-bold">W</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              WinShare
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              href="/templates"
              className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              Templates
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button size="sm" asChild className="rounded-md">
              <Link href="/sign-up">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-12 md:grid-cols-[2fr_1fr_1fr]">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
                  <span className="text-xs font-bold">W</span>
                </div>
                <span className="font-semibold">WinShare</span>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Generate branded celebration posts for social media in 30
                seconds. Built for service businesses across Australia.
              </p>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/pricing" className="transition-colors duration-200 hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="transition-colors duration-200 hover:text-foreground">
                    Templates
                  </Link>
                </li>
                <li>
                  <Link href="/sign-up" className="transition-colors duration-200 hover:text-foreground">
                    Get started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="transition-colors duration-200 hover:text-foreground">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="/" className="transition-colors duration-200 hover:text-foreground">
                    Terms of service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t pt-8">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} WinShare. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
