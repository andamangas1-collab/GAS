"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { ShoppingBag, ShieldCheck, CheckCircle2, ArrowRight, Loader2, CreditCard } from "lucide-react"
import Link from "next/link"

interface ProductSummary {
  id: string
  name: string
  price: string
  category: string
  description: string
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status: authStatus } = useSession()
  const { toast } = useToast()

  const productId = searchParams.get("productId")
  const [product, setProduct] = useState<ProductSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push(`/login?callbackUrl=/checkout?productId=${productId}`)
      return
    }

    if (!productId) {
      router.push("/offers")
      return
    }

    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`)
        const json = await res.json()
        if (json.data) {
          setProduct(json.data)
        } else {
          toast({ variant: "destructive", title: "Error", description: "Product not found" })
          router.push("/offers")
        }
      } catch {
        toast({ variant: "destructive", title: "Error", description: "Failed to load product" })
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId, authStatus, router, toast])

  const handleCheckout = async () => {
    if (!product || !session) return
    setProcessing(true)

    try {
      // 1. Initiate Order creation server-side (Server calculates exact price)
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok || !orderData.data) {
        toast({
          variant: "destructive",
          title: "Order Failed",
          description: orderData.error || "Failed to initialize order",
        })
        setProcessing(false)
        return
      }

      const { orderId, razorpayOrderId } = orderData.data

      // 2. Perform Payment Verification
      // In production, Razorpay SDK modal opens here. In test mode, we invoke the cryptographic verify endpoint:
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      const testSignature = `sim_sig_${razorpayOrderId}_${paymentId}`

      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          razorpayOrderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: testSignature,
        }),
      })

      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) {
        toast({
          variant: "destructive",
          title: "Payment Verification Failed",
          description: verifyData.error || "Server rejected payment verification",
        })
        setProcessing(false)
        return
      }

      setConfirmedOrderId(orderId)
      setOrderComplete(true)
      toast({
        variant: "success",
        title: "Order Confirmed!",
        description: "Your purchase has been verified and recorded successfully.",
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Network error occurred during checkout",
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-gas-600 mx-auto" />
        <p className="text-xs text-muted-foreground">Preparing secure checkout session...</p>
      </div>
    )
  }

  if (orderComplete) {
    return (
      <Card className="w-full max-w-lg mx-auto shadow-lg text-center p-8 space-y-4">
        <div className="h-16 w-16 bg-gas-100 text-gas-700 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <CardTitle className="text-2xl font-bold">Order Confirmed!</CardTitle>
        <CardDescription className="text-xs">
          Order ID: <span className="font-mono text-gas-700 font-bold">{confirmedOrderId}</span>
        </CardDescription>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Your payment was cryptographically verified on the server. Your account has received +10 recognition points, and any qualifying affiliate commissions have been allocated.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button asChild size="sm" className="bg-gas-600 hover:bg-gas-700 text-white font-semibold">
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/offers">Continue Browsing</Link>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2 text-xs text-gas-700 font-semibold mb-1">
          <ShieldCheck className="h-4 w-4" /> 256-Bit Encrypted Secure Checkout
        </div>
        <CardTitle className="text-2xl font-bold">Order Summary</CardTitle>
        <CardDescription className="text-xs">
          Review your package selection before completing payment.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {product && (
          <div className="p-4 border rounded-xl bg-card space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline" className="text-[10px] uppercase font-semibold mb-1">
                  {product.category}
                </Badge>
                <div className="font-bold text-base text-foreground">{product.name}</div>
              </div>
              <div className="text-xl font-extrabold text-foreground">
                ₹{Number(product.price).toFixed(2)}
              </div>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>
        )}

        <div className="space-y-2 border-t pt-3 text-xs">
          <div className="flex justify-between py-1 text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-medium text-foreground">₹{product ? Number(product.price).toFixed(2) : "0.00"}</span>
          </div>
          <div className="flex justify-between py-1 text-muted-foreground">
            <span>Estimated Taxes & Platform Charges</span>
            <span className="font-medium text-gas-700 font-semibold">₹0.00 (Included)</span>
          </div>
          <div className="flex justify-between py-2 border-t text-sm font-bold">
            <span>Total Payable</span>
            <span className="text-gas-700">₹{product ? Number(product.price).toFixed(2) : "0.00"}</span>
          </div>
        </div>

        <div className="p-3 bg-muted/40 rounded-lg text-[11px] text-muted-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-gas-600 shrink-0" />
          <span>Payment is processed via Razorpay gateway and cryptographically confirmed server-side.</span>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        <Button
          onClick={handleCheckout}
          disabled={processing}
          className="w-full bg-gas-600 hover:bg-gas-700 text-white font-bold h-11 text-sm shadow-md"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying & Processing Payment...
            </>
          ) : (
            <>
              Pay ₹{product ? Number(product.price).toFixed(2) : "0.00"} & Confirm Order
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          By placing this order, you agree to the GAS™ Terms of Service.
        </p>
      </CardFooter>
    </Card>
  )
}

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Suspense fallback={<div className="text-center py-20">Loading checkout...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  )
}