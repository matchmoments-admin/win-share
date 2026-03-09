import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { getCurrentOrg } from "@/lib/auth";
import { checkUsageLimit } from "@/lib/usage/check";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let postUsage: { current: number; limit: number } | null = null;

  try {
    const { orgId } = await getCurrentOrg();
    const usage = await checkUsageLimit(orgId, "post_generated");
    postUsage = { current: usage.current, limit: usage.limit };
  } catch {
    // Not authenticated or no org — sidebar will render without usage
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar: hidden on mobile, visible on lg+ */}
      <div className="hidden lg:flex">
        <Sidebar postUsage={postUsage} />
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header postUsage={postUsage} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
