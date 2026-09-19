"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowRight, Loader2, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react"
import { GASLogo } from "@/components/branding/GASLogo"

export default function ForgotPasswordPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Send reset request (or simulation for MVP)
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      })

      // Regardless of whether endpoint exists or returns 200, display safe notification
      setSubmitted(true)
      toast({
        variant: "success",
        title: "Instructions Sent",
        description: "If an active account exists for this email, password reset instructions have been dispatched.",
      })
    } catch {
      setSubmitted(true)
      toast({
        variant: "success",
        title: "Instructions Sent",
        description: "If an active account exists for this email, password reset instructions have been dispatched.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md mx-auto shadow-lg border-muted">
        <CardHeader className="text-center flex flex-col items-center">
          <div className="mb-3">
            <GASLogo variant="full" size="md" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {submitted ? "Check Your Email" : "Reset Your Password"}
          </CardTitle>
          <CardDescription>
            {submitted
              ? "We have dispatched password recovery instructions to your registered email address."
              : "Enter your registered email and we'll send you recovery instructions."}
          </CardDescription>
        </CardHeader>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Registered Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gas-600 hover:bg-gas-700 text-white font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Link...
                  </>
                ) : (
                  <>
                    Send Recovery Link <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardContent className="space-y-6 text-center">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs leading-relaxed">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 mx-auto mb-2" />
              If <strong>{email}</strong> is registered on GAS™, please check your inbox (and spam folder) for a secure reset link.
            </div>

            <Link
              href="/login"
              className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-gas-600 hover:bg-gas-700 text-white text-xs font-bold transition-colors"
            >
              Return to Sign In
            </Link>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
