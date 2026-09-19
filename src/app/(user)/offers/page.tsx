import { prisma } from "@/lib/prisma"
import { OffersClient, ProductItem } from "./OffersClient"

export const dynamic = "force-dynamic"

export default async function OffersPage() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: {
      commissionRules: { where: { isActive: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  // Format decimal / string types cleanly for client component
  const initialProducts: ProductItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    price: p.price.toString(),
    imageUrl: p.imageUrl,
    commissionRules: p.commissionRules.map((r) => ({
      type: r.type,
      value: r.value.toString(),
    })),
  }))

  return <OffersClient initialProducts={initialProducts} />
}