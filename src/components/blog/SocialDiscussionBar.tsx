"use client"

import {
  MessageSquare,
  Twitter,
  Linkedin,
  Send,
  MessageCircle,
  Youtube,
  ExternalLink,
} from "lucide-react"

export interface SocialLinksData {
  twitter?: string
  linkedin?: string
  telegram?: string
  whatsapp?: string
  youtube?: string
}

interface SocialDiscussionBarProps {
  socialLinks?: SocialLinksData | null
  className?: string
}

export function SocialDiscussionBar({
  socialLinks,
  className = "",
}: SocialDiscussionBarProps) {
  if (!socialLinks) return null

  const channels = [
    {
      key: "twitter",
      label: "Discuss on X",
      url: socialLinks.twitter,
      icon: Twitter,
      colorClass: "hover:border-sky-500 hover:text-sky-500 hover:bg-sky-500/10",
    },
    {
      key: "linkedin",
      label: "Join LinkedIn Debate",
      url: socialLinks.linkedin,
      icon: Linkedin,
      colorClass: "hover:border-blue-600 hover:text-blue-600 hover:bg-blue-600/10",
    },
    {
      key: "telegram",
      label: "Telegram Group Thread",
      url: socialLinks.telegram,
      icon: Send,
      colorClass: "hover:border-sky-400 hover:text-sky-400 hover:bg-sky-400/10",
    },
    {
      key: "whatsapp",
      label: "WhatsApp Community Chat",
      url: socialLinks.whatsapp,
      icon: MessageCircle,
      colorClass: "hover:border-emerald-500 hover:text-emerald-500 hover:bg-emerald-500/10",
    },
    {
      key: "youtube",
      label: "Watch on YouTube",
      url: socialLinks.youtube,
      icon: Youtube,
      colorClass: "hover:border-rose-500 hover:text-rose-500 hover:bg-rose-500/10",
    },
  ].filter((c) => c.url && typeof c.url === "string" && c.url.trim() !== "")

  if (channels.length === 0) return null

  return (
    <div
      className={`rounded-2xl border border-border/70 bg-muted/20 p-5 space-y-3 ${className}`}
    >
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-gas-500" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
          Live Community Discussions
        </h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        This article has live discussion threads across our official social channels. Jump into the debate:
      </p>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {channels.map((ch) => {
          const Icon = ch.icon
          return (
            <a
              key={ch.key}
              href={ch.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-background/80 text-xs font-medium text-foreground transition-all duration-200 shadow-sm ${ch.colorClass}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{ch.label}</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </a>
          )
        })}
      </div>
    </div>
  )
}
