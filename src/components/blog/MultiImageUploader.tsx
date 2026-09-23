"use client"

import { useState, useRef } from "react"
import {
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Star,
  Copy,
  ExternalLink,
  Check,
  Loader2,
  FileImage,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface MultiImageUploaderProps {
  images: string[]
  coverImage?: string | null
  onChange: (images: string[]) => void
  onSetCoverImage: (url: string) => void
  onInsertMarkdown?: (markdownSnippet: string) => void
}

export function MultiImageUploader({
  images,
  coverImage,
  onChange,
  onSetCoverImage,
  onInsertMarkdown,
}: MultiImageUploaderProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [customUrl, setCustomUrl] = useState("")
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)

  const handleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    )

    if (fileArray.length === 0) {
      toast({
        variant: "destructive",
        title: "No valid images",
        description: "Please select valid image files (PNG, JPG, WEBP, GIF, SVG).",
      })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    fileArray.forEach((file) => formData.append("files", file))

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Upload failed")
      }

      const uploadedUrls: string[] = data.data?.urls || (data.data?.url ? [data.data.url] : [])

      if (uploadedUrls.length > 0) {
        const nextImages = [...images, ...uploadedUrls]
        onChange(nextImages)
        // Auto-set cover image if none set yet
        if (!coverImage && uploadedUrls[0]) {
          onSetCoverImage(uploadedUrls[0])
        }

        toast({
          title: "Images Uploaded!",
          description: `Successfully added ${uploadedUrls.length} image(s).`,
        })
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err.message || "Failed to upload image(s).",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleAddCustomUrl = () => {
    const trimmed = customUrl.trim()
    if (!trimmed) return
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "URL must begin with http://, https://, or /",
      })
      return
    }

    const next = [...images, trimmed]
    onChange(next)
    if (!coverImage) onSetCoverImage(trimmed)
    setCustomUrl("")
    toast({ title: "Image URL Added", description: "Image attached to article gallery." })
  }

  const handleRemove = (urlToRemove: string) => {
    const next = images.filter((u) => u !== urlToRemove)
    onChange(next)
    if (coverImage === urlToRemove) {
      onSetCoverImage(next[0] || "")
    }
  }

  const handleCopyTag = (url: string) => {
    const tag = `![Image](${url})`
    navigator.clipboard.writeText(tag)
    setCopiedUrl(url)
    setTimeout(() => setCopiedUrl(null), 2000)
    toast({ title: "Embed Tag Copied", description: "Markdown embed code copied to clipboard." })
  }

  return (
    <div className="space-y-4 rounded-xl border border-border/70 bg-card/60 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-gas-500" />
            Article Image Studio &amp; Multi-Photo Gallery
          </h4>
          <p className="text-xs text-muted-foreground">
            Upload screenshots, diagrams, and proof photos. Click thumbnail to embed into article.
          </p>
        </div>
        <Badge variant="outline" className="text-[11px] self-start sm:self-auto font-mono">
          {images.length} Image{images.length === 1 ? "" : "s"}
        </Badge>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          if (e.dataTransfer.files) {
            handleFiles(e.dataTransfer.files)
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? "border-gas-500 bg-gas-500/10 scale-[1.01]"
            : "border-border/70 hover:border-gas-500/60 hover:bg-muted/30"
        } ${isUploading ? "opacity-60 pointer-events-none" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files)
          }}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-gas-500" />
              <p className="text-xs font-semibold text-foreground">Uploading files...</p>
            </div>
          ) : (
            <>
              <div className="h-10 w-10 rounded-full bg-gas-500/10 flex items-center justify-center text-gas-500">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium text-foreground">
                <span className="text-gas-600 font-bold">Click to upload</span> or drag and drop multiple images
              </p>
              <p className="text-[11px] text-muted-foreground">PNG, JPG, WEBP, GIF, SVG up to 10MB each</p>
            </>
          )}
        </div>
      </div>

      {/* Direct Image URL input */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Or paste external image URL (Unsplash, Cloudinary, etc.)..."
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          className="text-xs h-9 bg-background/80"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAddCustomUrl()
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddCustomUrl}
          disabled={!customUrl.trim()}
          className="shrink-0 text-xs h-9 gap-1"
        >
          <Plus className="h-3.5 w-3.5" /> Add URL
        </Button>
      </div>

      {/* Uploaded Image Thumbnails Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
          {images.map((imgUrl, idx) => {
            const isCover = coverImage === imgUrl

            return (
              <div
                key={idx}
                className={`group relative rounded-lg border overflow-hidden bg-background/50 transition-all ${
                  isCover ? "border-gas-500 ring-2 ring-gas-500/30" : "border-border/60 hover:border-gas-400"
                }`}
              >
                {/* Image preview */}
                <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgUrl}
                    alt={`Uploaded ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {isCover && (
                    <div className="absolute top-2 left-2 bg-gas-600/90 backdrop-blur-sm text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <Star className="h-3 w-3 fill-white" /> Cover Photo
                    </div>
                  )}

                  {!isCover && (
                    <button
                      type="button"
                      onClick={() => onSetCoverImage(imgUrl)}
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 hover:bg-gas-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow flex items-center gap-1"
                      title="Set as Featured Cover Photo"
                    >
                      <Star className="h-2.5 w-2.5" /> Make Cover
                    </button>
                  )}
                </div>

                {/* Action Bar */}
                <div className="p-2 flex flex-col gap-1.5 bg-card border-t border-border/60">
                  {onInsertMarkdown && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onInsertMarkdown(`![Photo](${imgUrl})\n`)}
                      className="w-full text-xs h-7 font-semibold bg-gas-500/10 hover:bg-gas-500/20 text-gas-600 border-gas-500/20 gap-1"
                    >
                      <Plus className="h-3 w-3" /> Insert into Article
                    </Button>
                  )}

                  <div className="flex items-center justify-between text-xs pt-0.5 text-muted-foreground">
                    <button
                      type="button"
                      onClick={() => handleCopyTag(imgUrl)}
                      className="flex items-center gap-1 hover:text-foreground text-[11px] px-1 py-0.5 rounded"
                      title="Copy Markdown code"
                    >
                      {copiedUrl === imgUrl ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy Tag</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemove(imgUrl)}
                      className="text-rose-500 hover:text-rose-600 p-1 hover:bg-rose-500/10 rounded transition-colors"
                      title="Delete Photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
