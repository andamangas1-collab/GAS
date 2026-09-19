import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { AdminNav } from "@/components/layout/AdminNav"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin/dashboard")
  }

  const role = session.user.role
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    redirect("/dashboard?error=unauthorized")
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-muted/20">
      <AdminNav />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}