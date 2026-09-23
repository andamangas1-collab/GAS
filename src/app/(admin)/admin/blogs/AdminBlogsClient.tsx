"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Share2,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Edit,
  Clock,
  Sparkles,
  MessageSquare,
  Twitter,
  Linkedin,
  Send,
  MessageCircle,
  Youtube,
  Image as ImageIcon,
  ArrowLeft,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  Lightbulb,
  Info,
  AlertTriangle,
  Check,
  Save,
  PenLine,
  Upload,
  Loader2,
  Link as LinkIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { MultiImageUploader } from "@/components/blog/MultiImageUploader"
import { BlogBroadcastModal } from "@/components/blog/BlogBroadcastModal"
import { renderMarkdownBody } from "@/lib/format-markdown"

interface AdminBlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string | null
  images?: string[]
  socialLinks?: any
  category: string
  readTimeMinutes: number
  isPublished: boolean
  viewCount: number
  shareCount: number
  clapCount?: number
  publishedAt: string | Date
  createdAt: string | Date
  author: {
    email: string
    role: string
  }
}

interface AdminBlogsClientProps {
  initialPosts: AdminBlogPost[]
}

const emptyFormData = {
  title: "",
  excerpt: "",
  content: "",
  category: "Affiliate Strategy",
  readTimeMinutes: 5,
  coverImage: "",
  images: [] as string[],
  isPublished: true,
  socialLinks: {
    twitter: "",
    linkedin: "",
    telegram: "",
    whatsapp: "",
    youtube: "",
  },
}

export function AdminBlogsClient({ initialPosts }: AdminBlogsClientProps) {
  const { toast } = useToast()
  const [posts, setPosts] = useState<AdminBlogPost[]>(initialPosts)
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)

  // Editor mode: "none" | "create" | "edit"
  const [editorMode, setEditorMode] = useState<"none" | "create" | "edit">("none")
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editingPostOriginal, setEditingPostOriginal] = useState<AdminBlogPost | null>(null)
  const [editorTab, setEditorTab] = useState<"write" | "preview">("write")
  const [showSocialInputs, setShowSocialInputs] = useState(false)

  const contentTextareaRef = useRef<HTMLTextAreaElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [coverUrlInput, setCoverUrlInput] = useState("")

  // Form State
  const [formData, setFormData] = useState(emptyFormData)

  // Social Share modal state
  const [shareModalPost, setShareModalPost] = useState<AdminBlogPost | null>(null)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

  // Word count & estimated read time
  const wordCount = formData.content.trim()
    ? formData.content.trim().split(/\s+/).length
    : 0
  const autoEstimatedReadTime = Math.max(1, Math.ceil(wordCount / 200))

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleStartCreate = () => {
    setEditorMode("create")
    setEditingPostId(null)
    setEditingPostOriginal(null)
    setFormData(emptyFormData)
    setEditorTab("write")
    setShowSocialInputs(false)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleStartEdit = (post: AdminBlogPost) => {
    setEditorMode("edit")
    setEditingPostId(post.id)
    setEditingPostOriginal(post)
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category || "Affiliate Strategy",
      readTimeMinutes: post.readTimeMinutes || 5,
      coverImage: post.coverImage || "",
      images: Array.isArray(post.images) ? post.images : [],
      isPublished: post.isPublished,
      socialLinks: {
        twitter: post.socialLinks?.twitter || "",
        linkedin: post.socialLinks?.linkedin || "",
        telegram: post.socialLinks?.telegram || "",
        whatsapp: post.socialLinks?.whatsapp || "",
        youtube: post.socialLinks?.youtube || "",
      },
    })
    setShowSocialInputs(
      Boolean(
        post.socialLinks?.twitter ||
        post.socialLinks?.linkedin ||
        post.socialLinks?.telegram ||
        post.socialLinks?.whatsapp ||
        post.socialLinks?.youtube
      )
    )
    setEditorTab("write")
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleCloseEditor = () => {
    setEditorMode("none")
    setEditingPostId(null)
    setEditingPostOriginal(null)
  }

  // Quick Markdown formatting inserter
  const insertMarkdown = (before: string, after = "") => {
    const textarea = contentTextareaRef.current
    if (!textarea) {
      setFormData((prev) => ({
        ...prev,
        content: prev.content + "\n" + before + after,
      }))
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const newText =
      textarea.value.substring(0, start) +
      before +
      (selectedText || "") +
      after +
      textarea.value.substring(end)

    setFormData((prev) => ({ ...prev, content: newText }))

    setTimeout(() => {
      textarea.focus()
      const cursorPos = start + before.length + (selectedText.length || 0)
      textarea.setSelectionRange(cursorPos, cursorPos)
    }, 50)
  }

  // Cover Image Handlers
  const handleCoverUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please select a valid image file (PNG, JPG, WEBP, GIF, SVG).",
      })
      return
    }

    setIsUploadingCover(true)
    const uploadData = new FormData()
    uploadData.append("files", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
        credentials: "include",
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")

      const url = data.data?.urls?.[0] || data.data?.url
      if (url) {
        setFormData((prev) => ({
          ...prev,
          coverImage: url,
          images: prev.images.includes(url) ? prev.images : [url, ...prev.images],
        }))
        toast({
          title: "Cover Image Set!",
          description: "Featured photo updated successfully.",
        })
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: err.message || "Failed to upload image.",
      })
    } finally {
      setIsUploadingCover(false)
      if (coverFileInputRef.current) coverFileInputRef.current.value = ""
    }
  }

  const handleApplyCoverUrl = () => {
    const trimmed = coverUrlInput.trim()
    if (!trimmed) return
    if (
      !trimmed.startsWith("http://") &&
      !trimmed.startsWith("https://") &&
      !trimmed.startsWith("/")
    ) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Cover image URL must begin with http://, https://, or /",
      })
      return
    }

    setFormData((prev) => ({
      ...prev,
      coverImage: trimmed,
      images: prev.images.includes(trimmed) ? prev.images : [trimmed, ...prev.images],
    }))
    setCoverUrlInput("")
    toast({
      title: "Cover Image Set!",
      description: "Featured photo updated from URL.",
    })
  }

  const handleRemoveCover = () => {
    setFormData((prev) => ({ ...prev, coverImage: "" }))
    toast({
      title: "Cover Image Removed",
      description: "Article currently has no cover image.",
    })
  }

  const handleSaveArticle = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out the article title, summary, and content.",
      })
      return
    }

    setLoading(true)
    try {
      if (editorMode === "create") {
        const res = await fetch("/api/admin/blogs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || "Failed to create article")

        setPosts([result.data, ...posts])
        setEditorMode("none")
        setFormData(emptyFormData)

        toast({
          title: "Article Published!",
          description: `"${result.data.title}" has been created successfully.`,
        })

        // Prompt to share to socials
        setShareModalPost(result.data)
        setIsShareModalOpen(true)
      } else if (editorMode === "edit" && editingPostId) {
        const res = await fetch(`/api/admin/blogs/${editingPostId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        })
        const result = await res.json()
        if (!res.ok) throw new Error(result.error || "Failed to update article")

        setPosts(
          posts.map((p) => (p.id === editingPostId ? { ...p, ...result.data } : p))
        )
        setEditorMode("none")
        setEditingPostId(null)

        toast({
          title: "Article Updated!",
          description: `"${result.data.title}" has been updated successfully.`,
        })
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: err.message || "An unexpected error occurred.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePost = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")

      setPosts(posts.filter((p) => p.id !== id))
      toast({ title: "Article Deleted", description: `"${title}" has been removed.` })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Delete Failed", description: err.message })
    }
  }

  const handleTogglePublish = async (post: AdminBlogPost) => {
    try {
      const res = await fetch(`/api/admin/blogs/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !post.isPublished }),
      })
      if (!res.ok) throw new Error("Failed to update")

      setPosts(
        posts.map((p) => (p.id === post.id ? { ...p, isPublished: !p.isPublished } : p))
      )
      toast({
        title: post.isPublished ? "Article Moved to Drafts" : "Article Published Live",
      })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message })
    }
  }

  const openShareModal = (post: AdminBlogPost) => {
    setShareModalPost(post)
    setIsShareModalOpen(true)
  }

  // ============================================================
  // RENDER: FULL ARTICLE STUDIO (Create / Edit View)
  // ============================================================
  if (editorMode !== "none") {
    return (
      <div className="space-y-6">
        {/* Studio Top Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCloseEditor}
              className="h-9 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Articles
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-[10px] font-semibold ${
                    editorMode === "create"
                      ? "bg-gas-600 text-white"
                      : "bg-blue-600 text-white"
                  }`}
                >
                  {editorMode === "create" ? "New Article" : "Edit Mode"}
                </Badge>
                <span className="text-xs font-bold text-foreground line-clamp-1">
                  {formData.title.trim() || "Untitled Article"}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {editorMode === "create"
                  ? "Drafting new article for publication"
                  : `Last saved: ${
                      editingPostOriginal?.publishedAt
                        ? new Date(editingPostOriginal.publishedAt).toLocaleDateString()
                        : "Draft"
                    }`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCloseEditor}
              className="text-xs h-9 px-3"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={loading}
              onClick={() => handleSaveArticle()}
              className="bg-gas-600 hover:bg-gas-700 text-white font-bold text-xs h-9 px-5 gap-1.5 shadow-md shadow-gas-600/20"
            >
              <Save className="h-4 w-4" />
              {loading
                ? "Saving..."
                : editorMode === "create"
                ? "Publish Article"
                : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Studio Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Main Writing & Preview Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Title Card */}
            <Card className="border-border/80 shadow-sm bg-card">
              <CardContent className="p-5 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <PenLine className="h-3.5 w-3.5 text-gas-500" />
                  Article Headline *
                </label>
                <Input
                  required
                  placeholder="Enter a captivating article title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-xl sm:text-2xl font-black h-14 px-4 bg-background border-border/80 focus-visible:ring-gas-500 placeholder:text-muted-foreground/50"
                />
              </CardContent>
            </Card>

            {/* Featured Cover Photo Placement Studio */}
            <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
              <CardHeader className="p-4 pb-3 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-gas-500" />
                    Featured Cover Photo
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Primary 16:9 banner displayed on the article header, blog cards, and social share links.
                  </CardDescription>
                </div>
                {formData.coverImage ? (
                  <Badge className="bg-gas-600/90 text-white text-[11px] gap-1 shrink-0">
                    <Sparkles className="h-3 w-3 fill-white" /> Ready
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-500 border-amber-500/30 text-[10px] shrink-0">
                    Recommended
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {/* Hidden File Input */}
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleCoverUpload(file)
                  }}
                />

                {formData.coverImage ? (
                  /* COVER IMAGE PREVIEW & ACTIONS */
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden border border-border/80 bg-muted/20 shadow-md aspect-[16/9] max-h-80 w-full group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.coverImage}
                        alt="Article Cover"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex items-center gap-2">
                        <span className="bg-gas-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
                          <Sparkles className="h-3 w-3 fill-white" /> Featured Cover
                        </span>
                        <span className="bg-black/60 backdrop-blur-md text-white/90 text-[10px] px-2 py-0.5 rounded-full font-mono">
                          16:9 Ratio
                        </span>
                      </div>

                      {/* Bottom Controls Bar */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-white/90 truncate font-mono max-w-[60%] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                          {formData.coverImage}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            type="button"
                            size="sm"
                            disabled={isUploadingCover}
                            onClick={() => coverFileInputRef.current?.click()}
                            className="bg-white/90 hover:bg-white text-zinc-900 text-xs font-bold h-8 px-3 gap-1.5 shadow-md"
                          >
                            <Upload className="h-3.5 w-3.5" />
                            {isUploadingCover ? "Uploading..." : "Replace Photo"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={handleRemoveCover}
                            className="h-8 px-2.5 text-xs font-bold bg-rose-600/90 hover:bg-rose-600 shadow-md gap-1"
                            title="Remove Cover Photo"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* EMPTY COVER DROPZONE & OPTIONS */
                  <div className="space-y-3">
                    <div
                      onClick={() => coverFileInputRef.current?.click()}
                      className={`relative cursor-pointer rounded-2xl border-2 border-dashed border-border/80 hover:border-gas-500/70 hover:bg-gas-500/5 transition-all p-8 text-center flex flex-col items-center justify-center gap-2.5 ${
                        isUploadingCover ? "opacity-60 pointer-events-none" : ""
                      }`}
                    >
                      {isUploadingCover ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="h-9 w-9 animate-spin text-gas-500" />
                          <p className="text-xs font-bold text-foreground">Uploading cover photo...</p>
                        </div>
                      ) : (
                        <>
                          <div className="h-12 w-12 rounded-2xl bg-gas-500/10 border border-gas-500/20 flex items-center justify-center text-gas-600 dark:text-gas-400 shadow-inner">
                            <Upload className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              Upload Featured Cover Photo
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Drag and drop or click to browse files (16:9 ratio, PNG, JPG, WEBP up to 10MB)
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="bg-gas-600 hover:bg-gas-700 text-white font-semibold text-xs h-8 px-4 mt-1 gap-1.5 shadow-sm"
                          >
                            <Upload className="h-3.5 w-3.5" /> Choose Cover Image
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Or Paste Direct Image Link */}
                    <div className="flex items-center gap-2 pt-1">
                      <Input
                        type="url"
                        placeholder="Or paste external image link (https://...)"
                        value={coverUrlInput}
                        onChange={(e) => setCoverUrlInput(e.target.value)}
                        className="text-xs h-9 bg-background/80"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleApplyCoverUrl()
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!coverUrlInput.trim()}
                        onClick={handleApplyCoverUrl}
                        className="shrink-0 text-xs h-9 px-3 gap-1"
                      >
                        <LinkIcon className="h-3.5 w-3.5" /> Set as Cover
                      </Button>
                    </div>

                    {/* Quick Pick from Uploaded Article Images */}
                    {formData.images.length > 0 && (
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-[11px] font-semibold text-muted-foreground mb-2">
                          Or select from photos already uploaded in this article:
                        </p>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {formData.images.map((imgUrl, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setFormData((prev) => ({ ...prev, coverImage: imgUrl }))
                                toast({
                                  title: "Cover Image Selected",
                                  description: "Selected photo is now set as the featured cover.",
                                })
                              }}
                              className="relative shrink-0 h-14 w-24 rounded-lg overflow-hidden border border-border/70 hover:border-gas-500 hover:ring-2 hover:ring-gas-500/30 transition-all group"
                              title="Click to set as cover"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={imgUrl} alt="Thumbnail" className="h-full w-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                                Use as Cover
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Content Editor with Write / Preview Tabs */}
            <Card className="border-border/80 shadow-sm bg-card overflow-hidden">
              {/* Tab Header & Formatting Toolbar */}
              <div className="p-3 border-b border-border bg-muted/30 flex flex-wrap items-center justify-between gap-3">
                {/* Write vs Preview Toggle */}
                <div className="flex items-center bg-background rounded-lg p-0.5 border border-border">
                  <button
                    type="button"
                    onClick={() => setEditorTab("write")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      editorTab === "write"
                        ? "bg-gas-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <PenLine className="h-3.5 w-3.5" /> Write
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      editorTab === "preview"
                        ? "bg-gas-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Eye className="h-3.5 w-3.5" /> Live Preview
                  </button>
                </div>

                {/* Markdown Formatting Helpers (Visible in Write Mode) */}
                {editorTab === "write" && (
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("## ", "\n")}
                      title="Heading 2"
                      className="h-8 px-2 text-xs font-bold"
                    >
                      <Heading2 className="h-3.5 w-3.5 mr-0.5" /> H2
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("### ", "\n")}
                      title="Heading 3"
                      className="h-8 px-2 text-xs font-bold"
                    >
                      <Heading3 className="h-3.5 w-3.5 mr-0.5" /> H3
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("**", "**")}
                      title="Bold"
                      className="h-8 w-8 p-0"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("*", "*")}
                      title="Italic"
                      className="h-8 w-8 p-0"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("> ")}
                      title="Blockquote"
                      className="h-8 w-8 p-0"
                    >
                      <Quote className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown("- ")}
                      title="Bullet List"
                      className="h-8 w-8 p-0"
                    >
                      <List className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("> [!TIP] ", "\n")}
                      title="Pro Tip Box"
                      className="h-8 px-2 text-[11px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1"
                    >
                      <Lightbulb className="h-3.5 w-3.5" /> Tip
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("> [!NOTE] ", "\n")}
                      title="Note Box"
                      className="h-8 px-2 text-[11px] text-sky-600 dark:text-sky-400 border-sky-500/30 gap-1"
                    >
                      <Info className="h-3.5 w-3.5" /> Note
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertMarkdown("> [!WARNING] ", "\n")}
                      title="Warning Box"
                      className="h-8 px-2 text-[11px] text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> Warning
                    </Button>
                  </div>
                )}
              </div>

              {/* Editor Workspace Pane */}
              <CardContent className="p-0">
                {editorTab === "write" ? (
                  <div className="relative">
                    <textarea
                      ref={contentTextareaRef}
                      required
                      rows={18}
                      placeholder="Write your article paragraphs here...&#10;&#10;Formatting Tips:&#10;• Use ## for Section Titles&#10;• Use ### for Sub-headings&#10;• Use - for bullet lists&#10;• Use > [!TIP] for helpful tip callout boxes&#10;• Insert photos easily from the Photo Gallery below"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      className="w-full p-5 bg-background font-mono text-sm leading-relaxed text-foreground resize-y focus:outline-none focus:ring-0 border-0"
                    />

                    {/* Word count & Read Time Footer */}
                    <div className="px-5 py-2.5 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span>
                          <strong className="text-foreground">{wordCount}</strong> words
                        </span>
                        <span>•</span>
                        <span>
                          ~
                          <strong className="text-foreground">
                            {autoEstimatedReadTime}
                          </strong>{" "}
                          min read
                        </span>
                      </div>
                      <span className="text-[11px] font-mono opacity-80">
                        Markdown Supported
                      </span>
                    </div>
                  </div>
                ) : (
                  /* LIVE PREVIEW PANE */
                  <div className="p-6 bg-background space-y-6 min-h-[450px]">
                    {/* Preview Cover Photo */}
                    {formData.coverImage && (
                      <div className="relative rounded-2xl overflow-hidden border border-border shadow-md aspect-[16/9] max-h-80 bg-muted/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={formData.coverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Preview Article Header */}
                    <div className="space-y-2 border-b border-border/60 pb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {formData.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {formData.readTimeMinutes} min read
                        </span>
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-black text-foreground">
                        {formData.title || "Untitled Article"}
                      </h1>
                      <p className="text-sm text-muted-foreground italic">
                        {formData.excerpt || "No summary provided yet."}
                      </p>
                    </div>

                    {/* Rendered Markdown Body using Shared Engine */}
                    <div className="space-y-5 text-foreground/90 text-[15px] sm:text-base leading-relaxed">
                      {formData.content ? (
                        renderMarkdownBody(formData.content, {
                          paragraphClassName: "text-sm sm:text-base leading-relaxed",
                          headingClassName: "text-xl sm:text-2xl font-bold mt-6 mb-3",
                        })
                      ) : (
                        <div className="text-center py-12 text-muted-foreground text-xs italic">
                          Write paragraphs in the Write tab to see the live rendered preview here.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Multi-Image Uploader Studio */}
            <MultiImageUploader
              images={formData.images}
              coverImage={formData.coverImage}
              onChange={(imgs) => setFormData({ ...formData, images: imgs })}
              onSetCoverImage={(cover) =>
                setFormData({ ...formData, coverImage: cover })
              }
              onInsertMarkdown={(snippet) => insertMarkdown("\n" + snippet + "\n")}
            />
          </div>

          {/* RIGHT COLUMN: Sidebar Controls & Settings (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            {/* Publishing Control Card */}
            <Card className="border-border/80 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground">
                  Publishing &amp; Status
                </CardTitle>
                <CardDescription className="text-xs">
                  Control article availability and visibility.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-semibold text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) =>
                        setFormData({ ...formData, isPublished: e.target.checked })
                      }
                      className="rounded border-border text-gas-600 focus:ring-gas-500 h-4 w-4"
                    />
                    <span>{formData.isPublished ? "Published (Live)" : "Draft (Hidden)"}</span>
                  </label>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      formData.isPublished
                        ? "text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
                        : "text-amber-500 border-amber-500/30 bg-amber-500/10"
                    }`}
                  >
                    {formData.isPublished ? "Live" : "Draft"}
                  </Badge>
                </div>

                {/* Cover Photo Status Indicator */}
                <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
                    <ImageIcon className="h-3.5 w-3.5 text-gas-500" />
                    Cover Photo
                  </span>
                  {formData.coverImage ? (
                    <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Ready
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-500 font-medium">
                      Not Set
                    </span>
                  )}
                </div>

                {/* If editing, show stats summary */}
                {editorMode === "edit" && editingPostOriginal && (
                  <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-lg bg-muted/20 border border-border text-xs">
                    <div>
                      <p className="text-muted-foreground text-[10px]">Reads</p>
                      <p className="font-bold text-foreground">{editingPostOriginal.viewCount}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">Claps</p>
                      <p className="font-bold text-foreground">👏 {editingPostOriginal.clapCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">Shares</p>
                      <p className="font-bold text-foreground">{editingPostOriginal.shareCount}</p>
                    </div>
                  </div>
                )}

                <div className="pt-1 flex flex-col gap-2">
                  <Button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSaveArticle()}
                    className="w-full bg-gas-600 hover:bg-gas-700 text-white font-bold text-xs h-10 gap-2 shadow-md shadow-gas-600/20"
                  >
                    <Save className="h-4 w-4" />
                    {loading
                      ? "Saving Article..."
                      : editorMode === "create"
                      ? "Publish Article"
                      : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseEditor}
                    className="w-full text-xs h-9"
                  >
                    Cancel &amp; Discard
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Category & Read Time Card */}
            <Card className="border-border/80 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-foreground">
                  Article Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Topic Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full h-9 px-3 rounded-lg bg-background border border-border text-xs text-foreground focus:ring-1 focus:ring-gas-500"
                  >
                    <option value="Affiliate Strategy">Affiliate Strategy</option>
                    <option value="V2V Philosophy">V2V Philosophy</option>
                    <option value="Growth & Traffic">Growth & Traffic</option>
                    <option value="Product Updates">Product Updates</option>
                    <option value="Case Studies">Case Studies</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-semibold text-foreground">
                      Reading Time (Minutes)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          readTimeMinutes: autoEstimatedReadTime,
                        })
                      }
                      className="text-[10px] text-gas-600 hover:underline"
                    >
                      Auto: {autoEstimatedReadTime}m
                    </button>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={formData.readTimeMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        readTimeMinutes: parseInt(e.target.value, 10) || 5,
                      })
                    }
                    className="h-9 text-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO Summary Card */}
            <Card className="border-border/80 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground">
                    Summary &amp; SEO Excerpt
                  </CardTitle>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {formData.excerpt.length} chars
                  </span>
                </div>
                <CardDescription className="text-xs">
                  1-2 sentences displayed on Google, social media share cards, and article preview cards.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <textarea
                  required
                  rows={3}
                  placeholder="A concise summary of the article's core insight..."
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  className="w-full p-3 rounded-lg bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-gas-500 leading-relaxed"
                />
              </CardContent>
            </Card>

            {/* Social Discussion Links Card */}
            <Card className="border-border/80 shadow-sm bg-card">
              <CardHeader className="pb-3">
                <button
                  type="button"
                  onClick={() => setShowSocialInputs(!showSocialInputs)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <CardTitle className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-gas-500" />
                      Social Media Links
                    </CardTitle>
                    <CardDescription className="text-[11px] mt-0.5">
                      Connect live discussion posts ({showSocialInputs ? "Click to collapse" : "Click to expand"})
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px]">
                    {showSocialInputs ? "Hide" : "Expand"}
                  </Badge>
                </button>
              </CardHeader>
              {showSocialInputs && (
                <CardContent className="space-y-3 pt-0 border-t border-border/50 text-xs">
                  <div className="space-y-1 pt-3">
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                      <Twitter className="h-3.5 w-3.5 text-sky-500" /> X (Twitter) Post URL
                    </label>
                    <Input
                      type="url"
                      placeholder="https://x.com/username/status/..."
                      value={formData.socialLinks.twitter}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: {
                            ...formData.socialLinks,
                            twitter: e.target.value,
                          },
                        })
                      }
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                      <Linkedin className="h-3.5 w-3.5 text-blue-600" /> LinkedIn Post URL
                    </label>
                    <Input
                      type="url"
                      placeholder="https://www.linkedin.com/feed/update/..."
                      value={formData.socialLinks.linkedin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: {
                            ...formData.socialLinks,
                            linkedin: e.target.value,
                          },
                        })
                      }
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                      <Send className="h-3.5 w-3.5 text-sky-400" /> Telegram Discussion URL
                    </label>
                    <Input
                      type="url"
                      placeholder="https://t.me/channel/123"
                      value={formData.socialLinks.telegram}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: {
                            ...formData.socialLinks,
                            telegram: e.target.value,
                          },
                        })
                      }
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-500" /> WhatsApp Community Link
                    </label>
                    <Input
                      type="url"
                      placeholder="https://chat.whatsapp.com/..."
                      value={formData.socialLinks.whatsapp}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: {
                            ...formData.socialLinks,
                            whatsapp: e.target.value,
                          },
                        })
                      }
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                      <Youtube className="h-3.5 w-3.5 text-rose-500" /> YouTube Video URL
                    </label>
                    <Input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={formData.socialLinks.youtube}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          socialLinks: {
                            ...formData.socialLinks,
                            youtube: e.target.value,
                          },
                        })
                      }
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================
  // RENDER: ARTICLES DIRECTORY (List View)
  // ============================================================
  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Button
          onClick={handleStartCreate}
          size="sm"
          className="bg-gas-600 hover:bg-gas-700 text-white font-semibold gap-1.5 text-xs h-9 ml-auto shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Create New Article
        </Button>
      </div>

      {/* Articles Directory Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Article &amp; Images</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Views &amp; Activity</th>
                <th className="px-4 py-3 text-center">Share to Socials</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 max-w-sm">
                    <div className="flex items-center gap-3">
                      {post.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-12 w-20 object-cover rounded-lg border border-border shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="h-12 w-20 rounded-lg bg-muted/40 border border-dashed border-border/80 flex items-center justify-center text-muted-foreground shrink-0">
                          <ImageIcon className="h-4 w-4 opacity-40" />
                        </div>
                      )}
                      <div>
                        <div className="font-bold text-foreground line-clamp-1">
                          {post.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {post.excerpt}
                        </div>
                        <div className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-2">
                          <span className="font-mono">/{post.slug}</span>
                          {post.images && post.images.length > 0 && (
                            <span className="text-gas-600 font-medium">
                              📷 {post.images.length} images
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant="outline" className="text-[10px] font-medium">
                      {post.category}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      className="inline-flex items-center gap-1 cursor-pointer"
                      title="Click to toggle publish status"
                    >
                      {post.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-semibold border border-emerald-500/20">
                          <CheckCircle2 className="h-3 w-3" /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-semibold border border-amber-500/20">
                          <Clock className="h-3 w-3" /> Draft
                        </span>
                      )}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap text-muted-foreground text-[11px]">
                    <div className="flex items-center justify-center gap-3">
                      <span className="flex items-center gap-1" title="Reads">
                        <Eye className="h-3 w-3" /> {post.viewCount}
                      </span>
                      <span className="flex items-center gap-1" title="Claps">
                        👏 {post.clapCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-gas-500" title="Shares">
                        <Share2 className="h-3 w-3" /> {post.shareCount}
                      </span>
                    </div>
                  </td>

                  {/* 1-Click Social Share trigger */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openShareModal(post)}
                      className="h-7 px-2.5 text-[11px] font-bold border-gas-500/30 text-gas-600 hover:bg-gas-500/10 gap-1.5 shadow-sm"
                      title="Share to Social Media in 1 Click"
                    >
                      <Share2 className="h-3 w-3 text-gas-500" />
                      <span>Share</span>
                    </Button>
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                        title="Preview Live Article"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(post)}
                      className="h-7 w-7 p-0 text-gas-600 hover:text-gas-700 hover:bg-gas-500/10"
                      title="Edit Article"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                      title="Delete Article"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-muted-foreground">
                    No articles found. Click &quot;Create New Article&quot; to write your first post.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1-Click Social Share Modal */}
      <BlogBroadcastModal
        post={
          shareModalPost
            ? {
                id: shareModalPost.id,
                title: shareModalPost.title,
                slug: shareModalPost.slug,
                excerpt: shareModalPost.excerpt,
                coverImage: shareModalPost.coverImage,
                tags: [],
                category: shareModalPost.category,
              }
            : null
        }
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  )
}
