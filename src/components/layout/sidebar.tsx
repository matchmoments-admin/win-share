"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Image,
  Palette,
  Building2,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarUsage } from "@/components/layout/sidebar-usage";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Create Post", href: "/create", icon: PlusCircle },
  { name: "My Posts", href: "/posts", icon: Image },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Templates", href: "/templates", icon: Palette },
  { name: "Brand", href: "/brand", icon: Building2 },
  { name: "Billing", href: "/billing", icon: CreditCard },
];

interface SidebarProps {
  className?: string;
  postUsage?: { current: number; limit: number } | null;
}

export function Sidebar({ className, postUsage }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-60 flex-col border-r border-border/60 bg-sidebar",
        className
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-2.5 px-6">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background">
          <span className="text-xs font-bold">W</span>
        </div>
        <span className="text-base font-semibold tracking-tight">WinShare</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors duration-200",
                isActive
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Usage Meter */}
      {postUsage && (
        <div className="border-t border-border/60">
          <SidebarUsage current={postUsage.current} limit={postUsage.limit} />
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-border/60 px-6 py-4">
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} WinShare
        </p>
      </div>
    </aside>
  );
}
