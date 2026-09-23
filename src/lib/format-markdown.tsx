import React from "react"
import { Lightbulb, Info, AlertTriangle } from "lucide-react"

/**
 * Formats inline Markdown elements:
 * - [link text](url) -> Clickable anchor
 * - **bold text** -> <strong>
 * - *italic text* -> <em>
 * - `code snippet` -> <code>
 */
export function formatInlineMarkdown(text: string): React.ReactNode {
  if (!text) return text

  // Tokenize links, bold, italic, code
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|\*.*?\*|`.*?`)/g
  const parts = text.split(regex)

  if (parts.length === 1) {
    return text
  }

  return parts.map((part, index) => {
    if (!part) return null

    // Markdown Link: [text](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/)
    if (linkMatch) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gas-600 hover:text-gas-700 underline font-semibold transition-colors"
        >
          {linkMatch[1]}
        </a>
      )
    }

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={index} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }

    // Italic: *text*
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <em key={index} className="italic text-foreground/90">
          {part.slice(1, -1)}
        </em>
      )
    }

    // Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={index}
          className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs text-gas-600 dark:text-gas-400 border border-border/60"
        >
          {part.slice(1, -1)}
        </code>
      )
    }

    return part
  })
}

/**
 * Renders complete Markdown article body with headings, callouts, lists,
 * blockquotes, images, and full inline formatting.
 */
export function renderMarkdownBody(
  content: string,
  options?: {
    imageClassName?: string
    headingClassName?: string
    paragraphClassName?: string
  }
): React.ReactNode {
  if (!content) return null

  const paragraphs = content.split("\n\n")

  return paragraphs.map((paragraph, index) => {
    const trimmed = paragraph.trim()
    if (!trimmed) return null

    // 1. Markdown Image: ![caption](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imgMatch) {
      const caption = imgMatch[1]
      const imgUrl = imgMatch[2]
      return (
        <figure
          key={index}
          className={`my-8 rounded-3xl overflow-hidden border border-border/80 bg-muted/20 shadow-md ${
            options?.imageClassName || ""
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imgUrl}
            alt={caption || "Article visual"}
            className="w-full h-auto object-cover max-h-[520px]"
          />
          {caption && (
            <figcaption className="text-center text-xs text-muted-foreground py-2.5 px-4 italic border-t border-border/40 bg-card/40">
              {caption}
            </figcaption>
          )}
        </figure>
      )
    }

    // 2. Heading 2 (## Heading)
    if (trimmed.startsWith("## ")) {
      const rawText = trimmed.replace("## ", "")
      const cleanId = rawText
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      return (
        <h2
          key={index}
          id={cleanId}
          className={`text-2xl sm:text-3xl font-extrabold text-foreground mt-12 mb-4 tracking-tight border-b border-border/60 pb-3 scroll-mt-28 flex items-center gap-2 ${
            options?.headingClassName || ""
          }`}
        >
          {formatInlineMarkdown(rawText)}
        </h2>
      )
    }

    // 3. Heading 3 (### Heading)
    if (trimmed.startsWith("### ")) {
      const rawText = trimmed.replace("### ", "")
      const cleanId = rawText
        .replace(/\*\*/g, "")
        .replace(/\*/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      return (
        <h3
          key={index}
          id={cleanId}
          className="text-xl sm:text-2xl font-bold text-foreground mt-9 mb-3 tracking-tight scroll-mt-28"
        >
          {formatInlineMarkdown(rawText)}
        </h3>
      )
    }

    // 4. Callout: Pro Tip (> [!TIP])
    if (trimmed.startsWith("> [!TIP]")) {
      const calloutText = trimmed.replace("> [!TIP]", "").trim()
      return (
        <div
          key={index}
          className="my-6 p-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 text-foreground space-y-2 shadow-sm"
        >
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Lightbulb className="h-4 w-4" /> Pro Tip
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
            {formatInlineMarkdown(calloutText)}
          </p>
        </div>
      )
    }

    // 5. Callout: Note (> [!NOTE])
    if (trimmed.startsWith("> [!NOTE]")) {
      const calloutText = trimmed.replace("> [!NOTE]", "").trim()
      return (
        <div
          key={index}
          className="my-6 p-5 rounded-2xl border border-sky-500/30 bg-sky-500/5 text-foreground space-y-2 shadow-sm"
        >
          <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-xs uppercase tracking-wider">
            <Info className="h-4 w-4" /> Editorial Note
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
            {formatInlineMarkdown(calloutText)}
          </p>
        </div>
      )
    }

    // 6. Callout: Warning (> [!WARNING] or > [!CAUTION])
    if (trimmed.startsWith("> [!WARNING]") || trimmed.startsWith("> [!CAUTION]")) {
      const calloutText = trimmed.replace(/> \[(?:!WARNING|!CAUTION)\]/, "").trim()
      return (
        <div
          key={index}
          className="my-6 p-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-foreground space-y-2 shadow-sm"
        >
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" /> Important Reminder
          </div>
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90">
            {formatInlineMarkdown(calloutText)}
          </p>
        </div>
      )
    }

    // 7. Blockquote (> text)
    if (trimmed.startsWith("> ")) {
      const quoteText = trimmed.replace(/^>\s*/, "").replace(/"/g, "")
      return (
        <blockquote
          key={index}
          className="p-5 my-7 border-l-4 border-gas-500 bg-gas-500/5 rounded-r-2xl italic text-foreground text-base sm:text-lg leading-relaxed shadow-sm"
        >
          &quot;{formatInlineMarkdown(quoteText)}&quot;
        </blockquote>
      )
    }

    // 8. Unordered List (- or *)
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const items = trimmed
        .split("\n")
        .map((li) => li.replace(/^[-*]\s+/, ""))
      return (
        <ul key={index} className="list-disc pl-6 space-y-2.5 my-5 text-base sm:text-[17px]">
          {items.map((it, i) => (
            <li key={i} className="text-foreground/90 leading-relaxed">
              {formatInlineMarkdown(it)}
            </li>
          ))}
        </ul>
      )
    }

    // 9. Numbered List (1. )
    if (/^\d+\.\s/.test(trimmed)) {
      const items = trimmed
        .split("\n")
        .map((li) => li.replace(/^\d+\.\s+/, ""))
      return (
        <ol key={index} className="list-decimal pl-6 space-y-2.5 my-5 text-base sm:text-[17px]">
          {items.map((it, i) => (
            <li key={i} className="text-foreground/90 leading-relaxed">
              {formatInlineMarkdown(it)}
            </li>
          ))}
        </ol>
      )
    }

    // 10. Horizontal Rule (---)
    if (trimmed === "---") {
      return <hr key={index} className="my-10 border-border/60" />
    }

    // 11. Standard Paragraph with inline formatting
    return (
      <p
        key={index}
        className={`leading-relaxed text-foreground/90 whitespace-pre-line ${
          options?.paragraphClassName || ""
        }`}
      >
        {formatInlineMarkdown(trimmed)}
      </p>
    )
  })
}
