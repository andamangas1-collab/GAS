"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, Loader2 } from "lucide-react"
import { GASLogo } from "@/components/branding/GASLogo"

function RegisterForm() {

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [fullName, setFullName] = useState("")
  const [mobile, setMobile] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const ref = searchParams.get("ref")
    if (ref) {
      setReferralCode(ref.toUpperCase())
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!termsAccepted) {
      setErrors({ termsAccepted: "You must accept the terms and conditions" })
      return
    }

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          mobile,
          email,
          password,
          confirmPassword,
          referralCode: referralCode ? referralCode.trim() : undefined,
          termsAccepted,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.details) {
          const flatErrors: Record<string, string> = {}
          for (const key in data.details) {
            flatErrors[key] = data.details[key][0]
          }
          setErrors(flatErrors)
        } else {
          toast({
            variant: "destructive",
            title: "Registration Failed",
            description: data.error || "An error occurred during registration.",
          })
        }
        return
      }

      toast({
        variant: "success",
        title: "Registration Successful!",
        description: "Welcome to GAS™. Please sign in with your credentials.",
      })

      router.push("/login?registered=true")
    } catch {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Unable to complete registration. Please check your connection.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-muted">
      <CardHeader className="text-center flex flex-col items-center">
        <div className="mb-3">
          <GASLogo variant="full" size="md" />
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">Create Your Account</CardTitle>
        <CardDescription>
          Learn. Earn. Create Value. Get Recognised.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              type="tel"
              placeholder="10-digit mobile (e.g. 9876543210)"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />
            {errors.mobile && <p className="text-xs text-red-500">{errors.mobile}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 digit"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="referralCode">
              Referral Code <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Input
              id="referralCode"
              placeholder="e.g. GAS-ABC123"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            />
            {errors.referralCode && <p className="text-xs text-red-500">{errors.referralCode}</p>}
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-gas-600 focus:ring-gas-500 cursor-pointer"
            />
            <Label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed cursor-pointer font-normal">
              I agree to the <Link href="/terms" className="text-gas-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-gas-600 hover:underline">Privacy Policy</Link>.
            </Label>
          </div>
          {errors.termsAccepted && <p className="text-xs text-red-500">{errors.termsAccepted}</p>}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full bg-gas-600 hover:bg-gas-700 text-white font-semibold" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                Create Account <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-gas-600 font-semibold hover:underline">
              Sign In
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div className="text-center">Loading registration...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}