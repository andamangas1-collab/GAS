import React from "react"
import { Lightbulb, Info, AlertTriangle, Code, ArrowRight, Workflow, Check } from "lucide-react"

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
 * Helper to render visual Mermaid flowchart cards
 */
function renderMermaidFlowchart(code: string, index: number) {
  // Parse flowchart LR or TD nodes e.g. A[Label] --> B[Label]
  const cleanLines = code
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("flowchart") && !l.startsWith("graph"))

  const stepNodes: string[] = []
  cleanLines.forEach((line) => {
    const matches = line.matchAll(/\[(.*?)\]/g)
    for (const match of matches) {
      if (match[1] && !stepNodes.includes(match[1])) {
        stepNodes.push(match[1])
      }
    }
  })

  return (
    <div
      key={index}
      className="my-8 rounded-3xl border border-gas-500/30 bg-gradient-to-br from-card via-muted/30 to-gas-950/10 p-6 sm:p-7 shadow-lg space-y-4"
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gas-500/10 flex items-center justify-center text-gas-600 dark:text-gas-400">
            <Workflow className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Strategic Process Flowchart
          </span>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded bg-muted/60 border border-border/60">
          V2V Engine Lifecycle
        </span>
      </div>

      {stepNodes.length > 0 ? (
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 pt-2">
          {stepNodes.map((step, idx) => (
            <React.Fragment key={idx}>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-card border border-border/80 shadow-sm hover:border-gas-500/50 transition-colors">
                <span className="h-5 w-5 rounded-full bg-gas-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-semibold text-foreground">
                  {step}
                </span>
              </div>
              {idx < stepNodes.length - 1 && (
                <ArrowRight className="h-4 w-4 text-gas-500 shrink-0 hidden sm:block" />
              )}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 font-mono text-xs overflow-x-auto">
          {code}
        </pre>
      )}
    </div>
  )
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

    // 2. Code Block or Mermaid Diagram: ```...```
    if (trimmed.startsWith("```")) {
      const lines = trimmed.split("\n")
      const firstLine = lines[0].trim()
      const lang = firstLine.replace(/^```/, "").trim().toLowerCase()
      const codeLines = lines.slice(
        1,
        lines[lines.length - 1].trim() === "```" ? -1 : undefined
      )
      const rawCode = codeLines.join("\n")

      if (lang === "mermaid") {
        return renderMermaidFlowchart(rawCode, index)
      }

      return (
        <div
          key={index}
          className="my-6 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-md"
        >
          <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400">
            <span className="font-mono flex items-center gap-1.5 text-[11px]">
              <Code className="h-3.5 w-3.5 text-gas-400" />
              {lang || "code"}
            </span>
          </div>
          <pre className="p-4 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed text-zinc-200">
            <code>{rawCode}</code>
          </pre>
        </div>
      )
    }

    // 3. Heading 2 (## Heading)
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

    // 4. Heading 3 (### Heading)
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

    // 5. Callout: Pro Tip (> [!TIP])
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
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 text-justify text-left sm:text-justify hyphens-auto [text-align-last:left]">
            {formatInlineMarkdown(calloutText)}
          </p>
        </div>
      )
    }

    // 6. Callout: Note (> [!NOTE])
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
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 text-justify text-left sm:text-justify hyphens-auto [text-align-last:left]">
            {formatInlineMarkdown(calloutText)}
          </p>
        </div>
      )
    }

    // 7. Callout: Warning (> [!WARNING] or > [!CAUTION])
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
          <p className="text-sm sm:text-base leading-relaxed text-foreground/90 text-justify text-left sm:text-justify hyphens-auto [text-align-last:left]">
            {formatInlineMarkdown(calloutText)}
          </p>
        </div>
      )
    }

    // 8. Blockquote (> text)
    if (trimmed.startsWith("> ")) {
      const quoteText = trimmed.replace(/^>\s*/, "").replace(/"/g, "")
      return (
        <blockquote
          key={index}
          className="p-5 my-7 border-l-4 border-gas-500 bg-gas-500/5 rounded-r-2xl italic text-foreground text-base sm:text-lg leading-relaxed shadow-sm text-justify text-left sm:text-justify hyphens-auto [text-align-last:left]"
        >
          &quot;{formatInlineMarkdown(quoteText)}&quot;
        </blockquote>
      )
    }

    // 9. Mixed Paragraph with Embedded Bullet List (- or *)
    if (trimmed.includes("\n- ") || trimmed.includes("\n* ") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const lines = trimmed.split("\n")
      const textLines: string[] = []
      const listItems: string[] = []
      let inList = false

      for (const line of lines) {
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
          inList = true
          listItems.push(line.trim().replace(/^[-*]\s+/, ""))
        } else if (!inList) {
          textLines.push(line)
        } else {
          listItems.push(line)
        }
      }

      return (
        <div key={index} className="space-y-4 my-5">
          {textLines.length > 0 && (
            <p className="text-justify text-left sm:text-justify hyphens-auto [text-align-last:left] tracking-[0.01em] leading-[1.85] text-foreground/90 whitespace-pre-line">
              {formatInlineMarkdown(textLines.join("\n").trim())}
            </p>
          )}
          {listItems.length > 0 && (
            <ul className="list-disc pl-6 space-y-2.5 my-4 text-base sm:text-[17px]">
              {listItems.map((it, idx) => (
                <li
                  key={idx}
                  className="text-foreground/90 leading-relaxed text-justify text-left sm:text-justify hyphens-auto [text-align-last:left]"
                >
                  {formatInlineMarkdown(it)}
                </li>
              ))}
            </ul>
          )}
        </div>
      )
    }

    // 10. Numbered List or Mixed Paragraph with Numbered List (1. )
    if (/\n\d+\.\s/.test(trimmed) || /^\d+\.\s/.test(trimmed)) {
      const lines = trimmed.split("\n")
      const textLines: string[] = []
      const listItems: string[] = []
      let inList = false

      for (const line of lines) {
        if (/^\d+\.\s/.test(line.trim())) {
          inList = true
          listItems.push(line.trim().replace(/^\d+\.\s+/, ""))
        } else if (!inList) {
          textLines.push(line)
        } else {
          listItems.push(line)
        }
      }

      return (
        <div key={index} className="space-y-4 my-5">
          {textLines.length > 0 && (
            <p className="text-justify text-left sm:text-justify hyphens-auto [text-align-last:left] tracking-[0.01em] leading-[1.85] text-foreground/90 whitespace-pre-line">
              {formatInlineMarkdown(textLines.join("\n").trim())}
            </p>
          )}
          {listItems.length > 0 && (
            <ol className="list-decimal pl-6 space-y-2.5 my-4 text-base sm:text-[17px]">
              {listItems.map((it, idx) => (
                <li
                  key={idx}
                  className="text-foreground/90 leading-relaxed text-justify text-left sm:text-justify hyphens-auto [text-align-last:left]"
                >
                  {formatInlineMarkdown(it)}
                </li>
              ))}
            </ol>
          )}
        </div>
      )
    }

    // 11. Horizontal Rule (---)
    if (trimmed === "---") {
      return <hr key={index} className="my-10 border-border/60" />
    }

    // 12. Standard Paragraph with Justified Typography
    return (
      <p
        key={index}
        className={`text-justify text-left sm:text-justify hyphens-auto [text-align-last:left] tracking-[0.01em] leading-[1.85] text-foreground/90 whitespace-pre-line ${
          options?.paragraphClassName || ""
        }`}
      >
        {formatInlineMarkdown(trimmed)}
      </p>
    )
  })
}
