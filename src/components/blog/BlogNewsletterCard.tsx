"use client"

import { useState } from "react"
import { Mail, CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface BlogNewsletterCardProps {
  className?: string
}

export function BlogNewsletterCard({ className = "" }: BlogNewsletterCardProps) {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes("@")) {
      toast({
        variant: "destructive",
        title: "Invalid Email",
        description: "Please enter a valid email address.",
      })
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      toast({
        title: "Subscribed to GAS™ Dispatch!",
        description: "You will receive our weekly high-converting affiliate playbooks & V2V alerts.",
      })
    }, 600)
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gas-500/30 bg-gradient-to-br from-gas-500/5 via-muted/30 to-emerald-500/5 p-6 sm:p-8 backdrop-blur-md shadow-lg ${className}`}
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left max-w-lg">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gas-500/10 text-gas-600 dark:text-gas-400 text-xs font-bold tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            WEEKLY AFFILIATE GROWTH DISPATCH
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Master Direct 1-Tier Commerce &amp; V2V Recognition
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Get actionable case studies, viral distribution templates, and early alerts for high-yield catalog campaigns directly to your inbox.
          </p>
        </div>

        {submitted ? (
          <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span>You&apos;re subscribed! Keep an eye on your inbox.</span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto shrink-0"
          >
            <div className="relative w-full sm:w-72">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 h-10 text-xs bg-background/90 border-border/80"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto h-10 px-5 text-xs font-bold bg-gas-600 hover:bg-gas-700 text-white gap-1.5 shadow-md shadow-gas-600/20 shrink-0"
            >
              {loading ? "Joining..." : "Get Playbooks"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-center md:justify-start gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-gas-500" />
          Zero Spam Guarantee
        </span>
        <span>•</span>
        <span>Unsubscribe Anytime</span>
        <span>•</span>
        <span>100% Free Forever</span>
      </div>
    </div>
  )
}
