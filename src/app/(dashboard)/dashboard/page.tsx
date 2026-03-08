import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PlusCircle, Building2, Image } from "lucide-react";

const quickActions = [
  {
    title: "Create Post",
    description: "Generate a branded social media post in seconds.",
    href: "/create",
    icon: PlusCircle,
  },
  {
    title: "Brand Settings",
    description: "Set up your logo, colors, and contact info.",
    href: "/brand",
    icon: Building2,
  },
  {
    title: "View Posts",
    description: "Browse and manage all your generated posts.",
    href: "/posts",
    icon: Image,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Welcome to WinShare
        </h2>
        <p className="mt-1 text-muted-foreground">
          Create beautiful, branded social media posts to celebrate your wins
          and grow your business.
        </p>
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="group">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-primary">
                    Get started &rarr;
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
