import { db } from "@/lib/db";
import { templates } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";

export async function listTemplates(options?: {
  category?: string;
  industry?: string;
  organizationId?: string;
}) {
  const conditions = [eq(templates.isActive, true)];

  if (options?.category) {
    conditions.push(
      eq(templates.category, options.category as "business_win")
    );
  }

  if (options?.industry) {
    conditions.push(
      eq(templates.industry, options.industry as "mortgage_broker")
    );
  }

  // Show system templates + org-specific templates
  if (options?.organizationId) {
    conditions.push(
      or(
        eq(templates.isSystem, true),
        eq(templates.organizationId, options.organizationId)
      )!
    );
  } else {
    conditions.push(eq(templates.isSystem, true));
  }

  const result = await db.query.templates.findMany({
    where: and(...conditions),
    orderBy: (t, { desc }) => [desc(t.isSystem), desc(t.createdAt)],
  });

  return result;
}
