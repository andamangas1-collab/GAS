import { Metadata } from "next"
import { requireAdmin } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { AdminBlogsClient } from "./AdminBlogsClient"
import { BookOpen } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Blog Management | GAS™ Admin",
  description: "Manage, publish, and monitor articles and viral social telemetry.",
}

export default async function AdminBlogsPage() {
  await requireAdmin()

  const posts = await prisma.blogPost.findMany({
    include: {
      author: {
        select: { email: true, role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-gas-500" />
            Blog &amp; Knowledge Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create, edit, and orchestrate high-converting content assets with automatic affiliate link attribution.
          </p>
        </div>
      </div>

      <AdminBlogsClient initialPosts={posts as any} />
    </div>
  )
}
