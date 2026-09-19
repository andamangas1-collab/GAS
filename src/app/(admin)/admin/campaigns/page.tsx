import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminCampaignsClient from "./AdminCampaignsClient"

export const dynamic = "force-dynamic"

export default async function AdminCampaignsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/campaigns")
  }

  const [campaigns, products] = await Promise.all([
    prisma.campaign.findMany({
      include: {
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        name: true,
        price: true,
        category: true,
      },
      orderBy: { name: "asc" },
    }),
  ])

  return (
    <AdminCampaignsClient
      initialCampaigns={campaigns as any}
      availableProducts={products as any}
    />
  )
}