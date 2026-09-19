import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminOrdersClient from "./AdminOrdersClient"

export default async function AdminOrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/orders")
  }

  const orders = await prisma.order.findMany({
    include: {
      user: {
        select: {
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
      payment: {
        select: {
          status: true,
          method: true,
          razorpayOrderId: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              name: true,
              category: true,
            },
          },
        },
      },
      commissions: {
        select: {
          amount: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return <AdminOrdersClient initialOrders={orders as any} />
}