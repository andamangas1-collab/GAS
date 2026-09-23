"use client"

import { useState, useEffect } from "react"
import { ListFilter, ChevronDown, ChevronRight, Bookmark } from "lucide-react"

export interface TocItem {
  id: string
  text: string
  level: number // 2 for h2, 3 for h3
}

interface TableOfContentsProps {
  content: string
  className?: string
}

export function parseHeadings(markdown: string): TocItem[] {
  const lines = markdown.split("\n")
  const items: TocItem[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith("## ")) {
      const text = trimmed.replace("## ", "").replace(/\*\*/g, "").replace(/\*/g, "").trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      items.push({ id, text, level: 2 })
    } else if (trimmed.startsWith("### ")) {
      const text = trimmed.replace("### ", "").replace(/\*\*/g, "").replace(/\*/g, "").trim()
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      items.push({ id, text, level: 3 })
    }
  }

  return items
}

export function TableOfContents({ content, className = "" }: TableOfContentsProps) {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>("")
  const [isOpenMobile, setIsOpenMobile] = useState(false)

  useEffect(() => {
    const parsed = parseHeadings(content)
    setItems(parsed)
    if (parsed.length > 0) {
      setActiveId(parsed[0].id)
    }
  }, [content])

  // Track active section using IntersectionObserver
  useEffect(() => {
    if (items.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: "-80px 0% -60% 0%" }
    )

    items.forEach((item) => {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length < 2) return null

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 90 // Account for sticky header
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
      setActiveId(id)
      setIsOpenMobile(false)
    }
  }

  return (
    <>
      {/* Mobile Collapsible Dropdown */}
      <div className="lg:hidden mb-6 rounded-xl border border-border/70 bg-card/60 p-3 shadow-sm">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="w-full flex items-center justify-between text-xs font-bold text-foreground"
        >
          <span className="flex items-center gap-1.5">
            <ListFilter className="h-4 w-4 text-gas-500" />
            Table of Contents ({items.length} Sections)
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              isOpenMobile ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpenMobile && (
          <nav className="mt-3 pt-3 border-t border-border/50 space-y-1.5 text-xs">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToHeading(item.id)}
                className={`block w-full text-left py-1 px-2 rounded-md transition-all ${
                  item.level === 3 ? "pl-4 text-[11px]" : "font-semibold"
                } ${
                  activeId === item.id
                    ? "bg-gas-500/10 text-gas-600 font-bold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                {item.text}
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className={`hidden lg:block w-64 shrink-0 ${className}`}>
        <div className="sticky top-24 space-y-3 rounded-2xl border border-border/70 bg-card/40 p-4 backdrop-blur-md shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-border/60">
            <Bookmark className="h-4 w-4 text-gas-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              On This Page
            </h4>
          </div>

          <nav className="space-y-1 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1 text-xs scrollbar-none">
            {items.map((item) => {
              const isActive = activeId === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  className={`group flex items-start gap-1.5 w-full text-left py-1 px-2 rounded-lg transition-all ${
                    item.level === 3 ? "pl-5 text-[11px]" : "font-semibold text-xs"
                  } ${
                    isActive
                      ? "bg-gas-500/10 text-gas-600 font-bold border-l-2 border-gas-500"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  <ChevronRight
                    className={`h-3 w-3 mt-0.5 shrink-0 transition-transform ${
                      isActive ? "text-gas-500 translate-x-0.5" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                    }`}
                  />
                  <span className="line-clamp-2 leading-relaxed">{item.text}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
