import React from "react"
import Link from "next/link"

export interface GASLogoProps {
  variant?: "full" | "compact" | "icon-only" | "hero"
  theme?: "brand" | "light" | "dark"
  size?: "sm" | "md" | "lg" | "xl"
  showTagline?: boolean
  className?: string
  href?: string
}

export function GASLogo({
  variant = "compact",
  theme = "brand",
  size = "md",
  showTagline,
  className = "",
  href,
}: GASLogoProps) {

  // Dimension mappings
  const dimensions = {
    sm: { icon: 26, text: "text-base", subtext: "text-[9px]" },
    md: { icon: 34, text: "text-xl", subtext: "text-[10px]" },
    lg: { icon: 44, text: "text-2xl", subtext: "text-xs" },
    xl: { icon: 60, text: "text-4xl", subtext: "text-sm" },
  }[size]

  // Color mappings based on theme
  const colors = {
    brand: {
      text: "text-foreground",
      tm: "text-gas-600",
      tagline: "text-muted-foreground",
      primaryGradient: ["#2563eb", "#1d4ed8"], // Blue
      secondaryGradient: ["#059669", "#10b981"], // Emerald
      ring: "#3b82f6",
    },
    light: {
      text: "text-white",
      tm: "text-emerald-400",
      tagline: "text-white/70",
      primaryGradient: ["#60a5fa", "#3b82f6"],
      secondaryGradient: ["#34d399", "#10b981"],
      ring: "#60a5fa",
    },
    dark: {
      text: "text-slate-900",
      tm: "text-gas-600",
      tagline: "text-slate-500",
      primaryGradient: ["#1e40af", "#1d4ed8"],
      secondaryGradient: ["#047857", "#059669"],
      ring: "#2563eb",
    },
  }[theme]

  const showSub = showTagline !== undefined ? showTagline : variant === "full" || variant === "hero"

  const content = (
    <div
      className={`inline-flex items-center gap-2.5 select-none ${className}`}
      aria-label="GAS — Grand Affiliate System (V2V Value-to-Value Engine)"
    >
      {/* SVG Brand Mark */}
      <svg
        width={variant === "hero" ? dimensions.icon * 1.3 : dimensions.icon}
        height={variant === "hero" ? dimensions.icon * 1.3 : dimensions.icon}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-300 hover:scale-105"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="gasPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.primaryGradient[0]} />
            <stop offset="100%" stopColor={colors.primaryGradient[1]} />
          </linearGradient>
          <linearGradient id="gasSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.secondaryGradient[0]} />
            <stop offset="100%" stopColor={colors.secondaryGradient[1]} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Value Orbit Ring */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="url(#gasPrimary)"
          strokeWidth="4"
          strokeDasharray="16 8 8 8"
          strokeLinecap="round"
          className="animate-spin-slow opacity-80"
          style={{ transformOrigin: "center" }}
        />

        {/* Secondary Reciprocal V2V Orbit Ring */}
        <circle
          cx="50"
          cy="50"
          r="36"
          stroke="url(#gasSecondary)"
          strokeWidth="2.5"
          strokeDasharray="12 12"
          strokeLinecap="round"
          className="opacity-70"
        />

        {/* Central Geometric 'G' & Growth Arrow Hexagon Shield */}
        <polygon
          points="50,16 80,33 80,67 50,84 20,67 20,33"
          fill="url(#gasPrimary)"
          className="drop-shadow-md"
        />

        {/* Inner Stylized Value Apex Path */}
        <path
          d="M38 40 L50 28 L62 40 M50 28 L50 62 M40 54 L50 64 L60 54"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Node Accents representing Referral & Recognition */}
        <circle cx="50" cy="20" r="4" fill={colors.secondaryGradient[1]} />
        <circle cx="76" cy="65" r="3.5" fill="#FFFFFF" />
        <circle cx="24" cy="65" r="3.5" fill="#FFFFFF" />
      </svg>

      {/* Brand Text Block */}
      {variant !== "icon-only" && (
        <div className="flex flex-col leading-none">
          <div className="flex items-baseline gap-1">
            <span
              className={`font-black tracking-tight ${dimensions.text} ${colors.text} font-sans`}
            >
              GAS
            </span>
            <span
              className={`text-[10px] font-extrabold ${colors.tm} tracking-wider font-mono`}
            >
              ™
            </span>
          </div>

          {showSub && (
            <div
              className={`font-semibold tracking-wider uppercase ${dimensions.subtext} ${colors.tagline} mt-0.5`}
            >
              {variant === "hero" ? (
                <span>Grand Affiliate System • V2V™</span>
              ) : (
                <span>V2V™ Engine</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}

