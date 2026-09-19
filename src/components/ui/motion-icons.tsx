"use client"

import React from "react"

interface MotionIconProps {
  className?: string
  size?: number
}

/**
 * 1. Reciprocal V2V Value Loop Icon
 * Concentric animated arrows and orbiting particle dots
 */
export function AnimatedV2VLoop({ className = "", size = 24 }: MotionIconProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="v2vGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="v2vGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Outer Orbit with smooth dash spin */}
        <circle
          cx="24"
          cy="24"
          r="19"
          stroke="url(#v2vGrad1)"
          strokeWidth="2.5"
          strokeDasharray="18 10"
          strokeLinecap="round"
          className="animate-spin-slow origin-center opacity-85"
        />

        {/* Clockwise Upper Flow Arc */}
        <path
          d="M12 20 C14 12, 34 12, 36 20"
          stroke="url(#v2vGrad1)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polygon points="36,15 39,22 32,22" fill="#2563eb" />

        {/* Counter-Clockwise Lower Flow Arc */}
        <path
          d="M36 28 C34 36, 14 36, 12 28"
          stroke="url(#v2vGrad2)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polygon points="12,33 9,26 16,26" fill="#10b981" />

        {/* Central Core Value Node */}
        <circle cx="24" cy="24" r="4.5" fill="#3b82f6" className="animate-pulse" />
        <circle cx="24" cy="24" r="2" fill="#ffffff" />
      </svg>
    </div>
  )
}

/**
 * 2. Animated Shield of Audit Integrity
 * Breathing aura with progressive upward chevrons
 */
export function AnimatedShield({ className = "", size = 24 }: MotionIconProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>

        {/* Outer Shield Shell */}
        <path
          d="M24 4 L40 11 V22 C40 33 24 42 24 42 C24 42 8 33 8 22 V11 L24 4 Z"
          fill="url(#shieldGrad)"
          className="drop-shadow-sm opacity-90"
        />

        {/* Inner Shield Accent */}
        <path
          d="M24 8 L36 13.5 V22 C36 30.5 24 38 24 38 C24 38 12 30.5 12 22 V13.5 L24 8 Z"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeOpacity="0.4"
          fill="none"
        />

        {/* Verified Checkmark with subtle pulse */}
        <path
          d="M17 23 L22 28 L31 18"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

/**
 * 3. Animated Rupee Financial Energy Icon
 * Glowing coin edge with sparkling gleam
 */
export function AnimatedRupee({ className = "", size = 24 }: MotionIconProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>

        {/* Outer Coin Disc */}
        <circle cx="24" cy="24" r="20" fill="url(#goldGrad)" className="drop-shadow-md" />
        <circle cx="24" cy="24" r="17" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.4" fill="none" />

        {/* Rupee Symbol */}
        <path
          d="M17 15 H31 M17 20 H28 M17 15 H25 C28 15 28 25 21 25 H17 L29 34"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Specular Sparkle */}
        <circle cx="33" cy="14" r="2.5" fill="#ffffff" className="animate-ping opacity-75" />
      </svg>
    </div>
  )
}

/**
 * 4. Animated Trophy & Recognition Cup
 * Radiant crown with upward golden aura
 */
export function AnimatedTrophy({ className = "", size = 24 }: MotionIconProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6d28d9" />
          </linearGradient>
        </defs>

        {/* Cup Body */}
        <path
          d="M14 10 H34 V22 C34 28 29.5 32 24 32 C18.5 32 14 28 14 22 V10 Z"
          fill="url(#trophyGrad)"
        />

        {/* Cup Handles */}
        <path
          d="M14 14 H9 C7 14 6 16 6 18 V20 C6 23 9 25 14 25 M34 14 H39 C41 14 42 16 42 18 V20 C42 23 39 25 34 25"
          stroke="#8b5cf6"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Stem & Pedestal Base */}
        <path d="M24 32 V38 M16 42 H32" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />
        <rect x="18" y="38" width="12" height="4" rx="2" fill="#7c3aed" />

        {/* Star in Center */}
        <path
          d="M24 16 L25.5 19.5 L29 20 L26.5 22.5 L27 26 L24 24 L21 26 L21.5 22.5 L19 20 L22.5 19.5 Z"
          fill="#fef08a"
        />
      </svg>
    </div>
  )
}

/**
 * 5. Animated Single-Tier Direct Attribution Network Node
 * Emits radial sonar ping waves demonstrating non-MLM single-tier connections
 */
export function AnimatedNetwork({ className = "", size = 24 }: MotionIconProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="netGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* Central Referrer Hub */}
        <circle cx="24" cy="14" r="8" fill="url(#netGrad)" />
        <circle cx="24" cy="14" r="4" fill="#ffffff" />

        {/* Direct Single-Tier Connecting Rays */}
        <line x1="24" y1="22" x2="14" y2="34" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />
        <line x1="24" y1="22" x2="34" y2="34" stroke="#0ea5e9" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3" />

        {/* Direct Referred User A */}
        <circle cx="14" cy="36" r="6" fill="#10b981" />
        <circle cx="14" cy="36" r="2.5" fill="#ffffff" />

        {/* Direct Referred User B */}
        <circle cx="34" cy="36" r="6" fill="#10b981" />
        <circle cx="34" cy="36" r="2.5" fill="#ffffff" />

        {/* Single-Tier Stop Bar (Explicitly blocks downlines) */}
        <line x1="6" y1="44" x2="42" y2="44" stroke="#e2e8f0" strokeWidth="1.5" strokeDasharray="2 2" strokeOpacity="0.6" />
      </svg>
    </div>
  )
}

/**
 * 6. Animated V2V Idea Bulb
 * Glowing filament with radiating inspiration sparks
 */
export function AnimatedIdea({ className = "", size = 24 }: MotionIconProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="bulbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Bulb Glass */}
        <path
          d="M24 6 C16 6 12 12 12 19 C12 24 16 27 18 31 H30 C32 27 36 24 36 19 C36 12 32 6 24 6 Z"
          fill="url(#bulbGrad)"
          className="opacity-90"
        />

        {/* Bulb Base */}
        <rect x="19" y="32" width="10" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="20" y="36" width="8" height="3" rx="1.5" fill="#94a3b8" />
        <path d="M22 39 C22 41 26 41 26 39" stroke="#64748b" strokeWidth="2" />

        {/* Inner Glowing Filament */}
        <path
          d="M21 22 L24 14 L27 22"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Radiating Spark Rays */}
        <line x1="24" y1="1" x2="24" y2="4" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
        <line x1="9" y1="10" x2="6" y2="8" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
        <line x1="39" y1="10" x2="42" y2="8" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  )
}
