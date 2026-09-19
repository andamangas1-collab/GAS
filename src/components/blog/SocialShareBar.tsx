"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import {
  Share2,
  Copy,
  Check,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook,
  Send,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface SocialShareBarProps {
  title: string
  slug: string
  referralCode?: string | null
  className?: string
  variant?: "floating" | "inline"
}

export function SocialShareBar({
  title,
  slug,
  referralCode: explicitReferralCode,
  className = "",
  variant = "inline",
}: SocialShareBarProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  // Determine active referral code (from prop or session)
  const activeReferralCode =
    explicitReferralCode || (session?.user as any)?.referralCode || null

  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://singularityingolok.blog"

  // Build the shareable URL with the user's personal referral code attached
  const shareUrl = activeReferralCode
    ? `${baseUrl}/blog/${slug}?ref=${activeReferralCode}`
    : `${baseUrl}/blog/${slug}`

  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(`Check out: "${title}" on GAS™`)
  const shareText = encodeURIComponent(
    `🚀 Read: "${title}"\n\nLearn, earn, and build sustainable direct affiliate income:\n${shareUrl}`
  )

  const logShare = async (platform: string) => {
    try {
      await fetch(`/api/blogs/${slug}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      })
    } catch {}
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      logShare("copy")
      toast({
        title: "Link Copied!",
        description: activeReferralCode
          ? `Your personal affiliate link with code (${activeReferralCode}) is ready to paste.`
          : "Article link copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please manually copy the link from your browser address bar.",
      })
    }
  }

  const openShareWindow = (url: string, platform: string) => {
    logShare(platform)
    window.open(url, "_blank", "width=600,height=500,noopener,noreferrer")
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Read: "${title}" on GAS™`,
          url: shareUrl,
        })
        logShare("native")
      } catch {}
    } else {
      handleCopy()
    }
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${
        variant === "floating"
          ? "bg-background/95 backdrop-blur-md border border-border/80 p-2.5 rounded-2xl shadow-xl"
          : "p-4 rounded-xl border border-border/60 bg-muted/20"
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 mr-1 text-xs font-semibold text-muted-foreground">
        <Share2 className="h-3.5 w-3.5 text-gas-500" />
        <span>Share:</span>
      </div>

      {/* WhatsApp (Highest conversion in India & SEA) */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          openShareWindow(
            `https://api.whatsapp.com/send?text=${shareText}`,
            "whatsapp"
          )
        }
        className="h-8 px-2.5 text-xs text-emerald-600 hover:text-emerald-500 hover:bg-emerald-500/10 gap-1.5"
        title="Share to WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="hidden sm:inline">WhatsApp</span>
      </Button>

      {/* X / Twitter */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          openShareWindow(
            `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}&hashtags=GAS,AffiliateMarketing,V2V`,
            "twitter"
          )
        }
        className="h-8 px-2.5 text-xs text-sky-500 hover:text-sky-400 hover:bg-sky-500/10 gap-1.5"
        title="Share to X (Twitter)"
      >
        <Twitter className="h-4 w-4" />
        <span className="hidden sm:inline">X</span>
      </Button>

      {/* LinkedIn */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          openShareWindow(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
            "linkedin"
          )
        }
        className="h-8 px-2.5 text-xs text-blue-600 hover:text-blue-500 hover:bg-blue-500/10 gap-1.5"
        title="Share to LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
        <span className="hidden sm:inline">LinkedIn</span>
      </Button>

      {/* Facebook */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          openShareWindow(
            `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            "facebook"
          )
        }
        className="h-8 px-2.5 text-xs text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 gap-1.5"
        title="Share to Facebook"
      >
        <Facebook className="h-4 w-4" />
        <span className="hidden sm:inline">Facebook</span>
      </Button>

      {/* Telegram */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() =>
          openShareWindow(
            `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
            "telegram"
          )
        }
        className="h-8 px-2.5 text-xs text-sky-400 hover:text-sky-300 hover:bg-sky-400/10 gap-1.5"
        title="Share to Telegram"
      >
        <Send className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Telegram</span>
      </Button>

      {/* Copy Link with Affiliate Tag Indicator */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="h-8 px-2.5 text-xs border-gas-500/30 text-foreground hover:bg-gas-500/10 gap-1.5 ml-auto"
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-emerald-500 font-medium">Copied</span>
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5 text-gas-500" />
            <span>Copy Link</span>
          </>
        )}
      </Button>

      {/* Affiliate Tag Badge indicator if user has referral code */}
      {activeReferralCode && (
        <div className="w-full mt-1.5 pt-1.5 border-t border-border/40 flex items-center justify-between text-[11px] text-gas-600 dark:text-gas-400">
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Affiliate Tracking Active ({activeReferralCode})
          </span>
          <span className="text-muted-foreground text-[10px]">
            Earn commissions on reader conversions
          </span>
        </div>
      )}
    </div>
  )
}
