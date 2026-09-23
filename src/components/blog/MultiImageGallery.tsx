"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Sparkles,
  Images,
} from "lucide-react"

interface MultiImageGalleryProps {
  images: string[]
  title: string
  className?: string
}

export function MultiImageGallery({
  images,
  title,
  className = "",
}: MultiImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  // Filter out invalid/empty image URLs
  const validImages = images.filter((img) => img && typeof img === "string" && img.trim() !== "")

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false)
      if (e.key === "ArrowRight") {
        setActiveIndex((prev) => (prev + 1) % validImages.length)
      }
      if (e.key === "ArrowLeft") {
        setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [lightboxOpen, validImages.length])

  if (validImages.length === 0) return null

  const activeImage = validImages[activeIndex] || validImages[0]

  return (
    <section className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
        <span className="flex items-center gap-1.5 text-foreground font-bold">
          <Images className="h-4 w-4 text-gas-500" />
          Visual Gallery &amp; Exhibits
        </span>
        <span className="font-mono text-[11px]">
          {activeIndex + 1} of {validImages.length}
        </span>
      </div>

      {/* Main Showcase Hero Frame */}
      <div className="relative group rounded-2xl overflow-hidden border border-border/70 bg-black/5 dark:bg-black/30 shadow-md">
        <div
          className="relative aspect-video w-full overflow-hidden cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage}
            alt={`${title} visual ${activeIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4 text-white">
            <span className="text-xs font-medium backdrop-blur-md bg-black/40 px-3 py-1 rounded-full border border-white/20">
              Click to enlarge
            </span>
            <div className="p-2 rounded-full bg-black/50 backdrop-blur-md border border-white/20">
              <Maximize2 className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>

        {/* Next/Prev Navigation overlay (only if >1 image) */}
        {validImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
              }}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all border border-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setActiveIndex((prev) => (prev + 1) % validImages.length)
              }}
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md opacity-80 group-hover:opacity-100 transition-all border border-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Selector (if > 1 image) */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {validImages.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition-all w-20 sm:w-24 aspect-video ${
                activeIndex === i
                  ? "border-gas-500 ring-2 ring-gas-500/30 scale-105"
                  : "border-border/60 opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar with Counter and Close */}
          <div
            className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs font-mono bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
              {activeIndex + 1} / {validImages.length}
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Centered Image View */}
          <div
            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage}
              alt={`${title} enlarged`}
              className="max-h-[80vh] max-w-full object-contain rounded-xl shadow-2xl select-none"
            />

            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
                  }
                  className="absolute left-2 sm:-left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) => (prev + 1) % validImages.length)
                  }
                  className="absolute right-2 sm:-right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md border border-white/20 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
