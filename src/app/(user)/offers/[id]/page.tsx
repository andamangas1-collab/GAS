import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, ShoppingBag, ShieldCheck, Tag, Percent, Calendar, CheckCircle } from "lucide-react"

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      commissionRules: { where: { isActive: true } },
    },
  })

  if (!product || product.status !== "ACTIVE") {
    notFound()
  }

  const commissionRule = product.commissionRules[0]

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4 text-xs">
          <Link href="/offers">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Offers
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Image and Highlights */}
        <div className="md:col-span-1 space-y-4">
          <div className="w-full aspect-square rounded-xl bg-muted/40 border flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6 text-muted-foreground space-y-2">
                <ShoppingBag className="h-12 w-12 mx-auto text-gas-600 opacity-80" />
                <span className="text-xs">GAS™ Verified Package</span>
              </div>
            )}
          </div>

          <Card className="bg-gas-50/50 border-gas-200">
            <CardContent className="p-4 space-y-2 text-xs">
              <div className="font-semibold text-gas-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-gas-600" /> V2V™ Verification
              </div>
              <p className="text-muted-foreground text-[11px]">
                Direct affiliate attribution. 100% verified settlement through server-side Razorpay gateway.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Title, Details, Actions */}
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs uppercase font-semibold">
                {product.category}
              </Badge>
              {commissionRule && (
                <Badge variant="success" className="text-xs font-mono">
                  {commissionRule.type === "PERCENTAGE"
                    ? `${commissionRule.value}% Commission`
                    : `₹${commissionRule.value} Commission`}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {product.name}
            </h1>
            <div className="text-3xl font-black text-gas-700">
              ₹{Number(product.price).toFixed(2)}
            </div>
          </div>

          <div className="border-t border-b py-4 space-y-3">
            <h3 className="font-semibold text-sm">Product Overview</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-xl bg-card space-y-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Availability:</span>
                <span className="font-semibold text-gas-700">In Stock / Instant Access</span>
              </div>
              {product.endDate && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Offer Valid Until:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(product.endDate).toLocaleDateString("en-IN")}
                  </span>
                </div>
              )}
            </div>

            <Button size="lg" asChild className="w-full bg-gas-600 hover:bg-gas-700 text-white font-bold text-base shadow-md">
              <Link href={`/checkout?productId=${product.id}`}>
                Start Purchase <ShoppingBag className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}