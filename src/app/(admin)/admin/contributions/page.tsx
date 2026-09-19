import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminContributionsClient from "./AdminContributionsClient"

export default async function AdminContributionsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/contributions")
  }

  const contributions = await prisma.contribution.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          referralCode: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return <AdminContributionsClient initialContributions={contributions} />
}