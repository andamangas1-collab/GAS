"use client"

import { useState, useRef } from "react"
import { Sparkles, Heart } from "lucide-react"

interface ClapButtonProps {
  slug: string
  initialCount: number
  className?: string
  variant?: "floating" | "inline"
}

export function ClapButton({
  slug,
  initialCount = 0,
  className = "",
  variant = "inline",
}: ClapButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [userClaps, setUserClaps] = useState(0)
  const [floatingParticles, setFloatingParticles] = useState<Array<{ id: number; text: string }>>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pendingClapsRef = useRef<number>(0)

  const handleClap = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (userClaps >= 50) return // Cap at 50 claps per reader

    // Optimistic increment
    setCount((prev) => prev + 1)
    setUserClaps((prev) => prev + 1)
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 300)

    // Add floating particle animation
    const particleId = Date.now() + Math.random()
    setFloatingParticles((prev) => [...prev, { id: particleId, text: "+1" }])
    setTimeout(() => {
      setFloatingParticles((prev) => prev.filter((p) => p.id !== particleId))
    }, 1000)

    pendingClapsRef.current += 1

    // Debounce the network request
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(async () => {
      const clapsToSend = pendingClapsRef.current
      pendingClapsRef.current = 0
      try {
        await fetch(`/api/blogs/${slug}/react`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "CLAP", count: clapsToSend }),
        })
      } catch (err) {
        console.error("Failed to record claps", err)
      }
    }, 800)
  }

  const isMax = userClaps >= 50

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Floating particles */}
      {floatingParticles.map((particle) => (
        <span
          key={particle.id}
          className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold text-gas-500 animate-out fade-out slide-out-to-top duration-1000 select-none"
        >
          👏 {particle.text}
        </span>
      ))}

      <button
        type="button"
        onClick={handleClap}
        disabled={isMax}
        title={isMax ? "Max claps reached for this article" : "Clap to applaud this article"}
        className={`group relative flex items-center gap-2 rounded-full border transition-all active:scale-95 ${
          variant === "floating"
            ? "px-4 py-2 bg-background/95 backdrop-blur-md shadow-lg border-border/80 hover:border-gas-500 hover:shadow-gas-500/10"
            : "px-3.5 py-1.5 bg-muted/30 border-border/60 hover:bg-gas-500/10 hover:border-gas-500/40"
        } ${isAnimating ? "scale-110" : ""}`}
      >
        <span
          className={`text-base transition-transform group-hover:scale-125 ${
            isAnimating ? "rotate-12" : ""
          }`}
        >
          👏
        </span>

        <span className="text-xs font-bold text-foreground font-mono">
          {count.toLocaleString()}
        </span>

        {userClaps > 0 && (
          <span className="text-[10px] font-semibold text-gas-600 bg-gas-500/10 px-1.5 py-0.5 rounded-full">
            +{userClaps}
          </span>
        )}
      </button>
    </div>
  )
}
