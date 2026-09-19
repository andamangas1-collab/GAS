"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, Loader2 } from "lucide-react"
import { GASLogo } from "@/components/branding/GASLogo"

function LoginForm() {

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const registered = searchParams.get("registered") === "true"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.toLowerCase().trim(),
        password,
      })

      const errorMessage =
        result?.error && result.error !== "CredentialsSignin"
          ? result.error
          : "Invalid email or password. Please verify your credentials."

      if (!result || result.error) {
        toast({
          variant: "destructive",
          title: "Authentication Failed",
          description: errorMessage,
        })
        return
      }


      toast({
        variant: "success",
        title: "Signed In",
        description: "Welcome back to GAS™.",
      })

      router.push(callbackUrl)
      router.refresh()
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during login.",
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
        <CardTitle className="text-2xl font-bold text-foreground">Sign In</CardTitle>
        <CardDescription>
          {registered
            ? "Account created successfully! Please sign in."
            : "Enter your credentials to access your dashboard"}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
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
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-gas-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full bg-gas-600 hover:bg-gas-700 text-white font-semibold" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-gas-600 font-semibold hover:underline">
              Create one now
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div className="text-center">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}