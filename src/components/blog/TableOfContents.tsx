"use client"

import { useState, useEffect } from "react"
import { ListFilter, ChevronDown, ChevronRight, Bookmark, Sparkles } from "lucide-react"

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
      { rootMargin: "-90px 0% -65% 0%" }
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
      const offset = 100 // Account for fixed reading progress bar and top bar
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
      <div className="lg:hidden mb-8 rounded-2xl border border-border/80 bg-card/70 p-4 shadow-sm backdrop-blur-md">
        <button
          type="button"
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="w-full flex items-center justify-between text-xs font-bold text-foreground"
        >
          <span className="flex items-center gap-2 text-gas-600 dark:text-gas-400">
            <ListFilter className="h-4 w-4" />
            Quick Navigation ({items.length} Sections)
          </span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
              isOpenMobile ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpenMobile && (
          <nav className="mt-3 pt-3 border-t border-border/50 space-y-1 text-xs">
            {items.map((item) => {
              const isActive = activeId === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  className={`block w-full text-left py-1.5 px-3 rounded-lg transition-all ${
                    item.level === 3 ? "pl-6 text-[11px]" : "font-medium"
                  } ${
                    isActive
                      ? "bg-gas-500/15 text-gas-600 dark:text-gas-400 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  }`}
                >
                  {item.text}
                </button>
              )
            })}
          </nav>
        )}
      </div>

      {/* Desktop Sticky Sidebar */}
      <aside className={`hidden lg:block w-72 shrink-0 ${className}`}>
        <div className="sticky top-24 space-y-4 rounded-3xl border border-border/70 bg-card/60 p-5 backdrop-blur-xl shadow-lg shadow-black/5">
          <div className="flex items-center justify-between pb-3 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gas-500/10 flex items-center justify-center text-gas-500">
                <Bookmark className="h-3.5 w-3.5" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                In This Article
              </h4>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground font-semibold">
              {items.length} sections
            </span>
          </div>

          <nav className="space-y-1 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1 text-xs scrollbar-none">
            {items.map((item) => {
              const isActive = activeId === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToHeading(item.id)}
                  className={`group flex items-start gap-2 w-full text-left py-1.5 px-2.5 rounded-xl transition-all duration-150 ${
                    item.level === 3 ? "pl-6 text-[11px]" : "font-medium text-xs"
                  } ${
                    isActive
                      ? "bg-gas-500/10 text-gas-600 dark:text-gas-400 font-bold border-l-2 border-gas-500 shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                  }`}
                >
                  <ChevronRight
                    className={`h-3.5 w-3.5 mt-0.5 shrink-0 transition-transform ${
                      isActive
                        ? "text-gas-500 translate-x-0.5"
                        : "text-muted-foreground/30 group-hover:text-muted-foreground"
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
