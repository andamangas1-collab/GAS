"use client"

import { useState } from "react"
import {
  Share2,
  X,
  MessageCircle,
  Twitter,
  Linkedin,
  Send,
  Facebook,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Zap,
  Globe,
  Radio,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface BroadcastPostData {
  id: string
  title: string
  slug: string
  excerpt: string
  coverImage?: string | null
  tags: string[]
  category: string
}

interface BlogBroadcastModalProps {
  post: BroadcastPostData | null
  isOpen: boolean
  onClose: () => void
}

export function BlogBroadcastModal({
  post,
  isOpen,
  onClose,
}: BlogBroadcastModalProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"whatsapp" | "twitter" | "linkedin" | "telegram" | "webhooks">("whatsapp")
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [isBroadcastingWebhook, setIsBroadcastingWebhook] = useState(false)

  if (!isOpen || !post) return null

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://singularityingolok.blog"
  const articleUrl = `${origin}/blog/${post.slug}`

  // 1. WhatsApp Copy
  const whatsappCopy = `📢 *NEW ON GAS™*: ${post.title}\n\n${post.excerpt}\n\n👉 *Read the full strategy here*:\n${articleUrl}\n\n_100% transparent single-tier affiliate commerce._`

  // 2. X / Twitter Copy
  const twitterTags = ["#AffiliateMarketing", "#PassiveIncome", "#SideHustle", "#GAS"]
  const twitterCopy = `🚀 ${post.title.length > 70 ? post.title.slice(0, 67) + "..." : post.title}\n\n${post.excerpt.length > 110 ? post.excerpt.slice(0, 107) + "..." : post.excerpt}\n\nRead here 👇\n${articleUrl}\n\n${twitterTags.join(" ")}`

  // 3. LinkedIn Copy
  const linkedinCopy = `🌟 Insights for Digital Affiliates & Growth Operators:\n\n"${post.title}"\n\n${post.excerpt}\n\nKey discussion points:\n• Why single-tier transparent compensation outperforms legacy multi-level schemes.\n• Practical tips to grow your sales and earnings.\n• Value-to-Value (V2V) recognition.\n\nRead the full piece on the GAS™ publication:\n${articleUrl}\n\n#AffiliateMarketing #Commerce #CreatorEconomy #GrowthHacking`

  // 4. Telegram Copy
  const telegramCopy = `🔥 *${post.title}*\n\n${post.excerpt}\n\n📖 Read full guide: ${articleUrl}`

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
    toast({
      title: "Content Copied!",
      description: `Formatted copy for ${key.toUpperCase()} copied to clipboard.`,
    })
  }

  const openExternal = (url: string) => {
    window.open(url, "_blank", "width=700,height=600,noopener,noreferrer")
  }

  const handleTriggerWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Webhook URL",
        description: "Please enter a valid Make.com, Zapier, or Telegram Bot webhook endpoint.",
      })
      return
    }

    setIsBroadcastingWebhook(true)
    try {
      const res = await fetch(`/api/admin/blogs/${post.id}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ webhookUrls: [webhookUrl.trim()] }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send article")

      toast({
        title: "Sent Successfully!",
        description: `Article was sent to ${webhookUrl}`,
      })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sharing Failed",
        description: err.message,
      })
    } finally {
      setIsBroadcastingWebhook(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gas-500/10 flex items-center justify-center text-gas-500">
              <Share2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Share to Social Media in 1 Click
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                Sharing: &quot;{post.title}&quot;
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Channel Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-muted/40 border-b border-border/60 overflow-x-auto scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("whatsapp")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "whatsapp"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("twitter")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "twitter"
                ? "bg-sky-500 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Twitter className="h-3.5 w-3.5" /> X (Twitter)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("linkedin")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "linkedin"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Linkedin className="h-3.5 w-3.5" /> LinkedIn
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("telegram")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "telegram"
                ? "bg-sky-400 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Send className="h-3.5 w-3.5" /> Telegram
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("webhooks")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "webhooks"
                ? "bg-gas-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            <Zap className="h-3.5 w-3.5" /> Auto-Post (Webhook)
          </button>
        </div>

        {/* Tab Content Panes */}
        <div className="p-5 space-y-4">
          {activeTab === "whatsapp" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" /> Ready-to-Send WhatsApp Message
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(whatsappCopy, "whatsapp")}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px]"
                >
                  {copiedKey === "whatsapp" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Text
                </button>
              </div>
              <Textarea
                readOnly
                value={whatsappCopy}
                rows={6}
                className="font-mono text-xs bg-muted/20 resize-none"
              />
              <Button
                type="button"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold text-xs h-10"
                onClick={() =>
                  openExternal(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappCopy)}`)
                }
              >
                <MessageCircle className="h-4 w-4" /> Launch WhatsApp Web / App
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {activeTab === "twitter" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-500 flex items-center gap-1">
                  <Twitter className="h-4 w-4" /> Pre-Formatted Tweet with High-Traffic Hashtags
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(twitterCopy, "twitter")}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px]"
                >
                  {copiedKey === "twitter" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Tweet
                </button>
              </div>
              <Textarea
                readOnly
                value={twitterCopy}
                rows={6}
                className="font-mono text-xs bg-muted/20 resize-none"
              />
              <Button
                type="button"
                className="w-full bg-sky-500 hover:bg-sky-600 text-white gap-2 font-bold text-xs h-10"
                onClick={() =>
                  openExternal(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterCopy)}`)
                }
              >
                <Twitter className="h-4 w-4" /> Post on X (Twitter)
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {activeTab === "linkedin" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-600 flex items-center gap-1">
                  <Linkedin className="h-4 w-4" /> Executive Thought Leadership Post
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(linkedinCopy, "linkedin")}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px]"
                >
                  {copiedKey === "linkedin" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Post
                </button>
              </div>
              <Textarea
                readOnly
                value={linkedinCopy}
                rows={7}
                className="font-mono text-xs bg-muted/20 resize-none"
              />
              <Button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold text-xs h-10"
                onClick={() =>
                  openExternal(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`)
                }
              >
                <Linkedin className="h-4 w-4" /> Open LinkedIn Share Composer
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {activeTab === "telegram" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-sky-400 flex items-center gap-1">
                  <Send className="h-4 w-4" /> Markdown-Formatted Channel Update
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(telegramCopy, "telegram")}
                  className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px]"
                >
                  {copiedKey === "telegram" ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copy Markdown
                </button>
              </div>
              <Textarea
                readOnly
                value={telegramCopy}
                rows={5}
                className="font-mono text-xs bg-muted/20 resize-none"
              />
              <Button
                type="button"
                className="w-full bg-sky-500 hover:bg-sky-600 text-white gap-2 font-bold text-xs h-10"
                onClick={() =>
                  openExternal(`https://t.me/share/url?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(post.title)}`)
                }
              >
                <Send className="h-4 w-4" /> Send to Telegram
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {activeTab === "webhooks" && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gas-500/10 border border-gas-500/20 text-xs text-foreground space-y-1">
                <p className="font-bold flex items-center gap-1 text-gas-600 dark:text-gas-400">
                  <Zap className="h-3.5 w-3.5" /> Auto-Post to Social Media
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Provide a webhook URL from Make.com, Zapier, or Discord. GAS™ will automatically send this article information to post directly to your social channels.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Webhook URL (Make.com / Zapier / Discord / Telegram):
                </label>
                <Input
                  type="url"
                  placeholder="https://hook.eu1.make.com/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="text-xs h-10 bg-background/90"
                />
              </div>

              <Button
                type="button"
                disabled={isBroadcastingWebhook || !webhookUrl.trim()}
                onClick={handleTriggerWebhook}
                className="w-full bg-gas-600 hover:bg-gas-700 text-white font-bold text-xs h-10 gap-2 shadow-md shadow-gas-600/20"
              >
                {isBroadcastingWebhook ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending to Social Channels...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" /> Post to Social Channels via Webhook
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">
            Slug: /blog/{post.slug}
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="h-8 text-xs">
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
