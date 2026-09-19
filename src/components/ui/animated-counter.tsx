"use client"

import { useEffect, useState, useRef } from "react"

interface AnimatedCounterProps {
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
  duration = 1600,
  className = "",
}: AnimatedCounterProps) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    let start = 0
    const end = value
    const startTime = performance.now()

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Quintic ease-out function
      const easeOut = 1 - Math.pow(1 - progress, 4)
      const currentVal = Math.floor(easeOut * end)

      setCount(currentVal)

      if (progress < 1) {
        requestAnimationFrame(updateCounter)
      } else {
        setCount(end)
      }
    }

    const frameId = requestAnimationFrame(updateCounter)
    return () => cancelAnimationFrame(frameId)
  }, [hasStarted, value, duration])

  return (
    <span ref={ref} className={`font-mono font-black ${className}`}>
      {prefix}
      {count.toLocaleString("en-IN")}
      {suffix}
    </span>
  )
}
