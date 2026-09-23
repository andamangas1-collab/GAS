"use client"

import { useState } from "react"
import Link from "next/link"
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Share2,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Edit,
  Clock,
  Sparkles,
  Radio,
  Share,
  MessageSquare,
  Twitter,
  Linkedin,
  Send,
  MessageCircle,
  Youtube,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { MultiImageUploader } from "@/components/blog/MultiImageUploader"
import { BlogBroadcastModal } from "@/components/blog/BlogBroadcastModal"

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

export function AdminBlogsClient({ initialPosts }: AdminBlogsClientProps) {
  const { toast } = useToast()
  const [posts, setPosts] = useState<AdminBlogPost[]>(initialPosts)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSocialInputs, setShowSocialInputs] = useState(false)

  // Broadcast modal state
  const [broadcastPost, setBroadcastPost] = useState<AdminBlogPost | null>(null)
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)

  // Form State for new article
  const [newPost, setNewPost] = useState({
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
  })

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPost.title.trim() || !newPost.excerpt.trim() || !newPost.content.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill out all required fields (title, excerpt, content).",
      })
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPost),
      })
      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || "Failed to create post")
      }

      setPosts([result.data, ...posts])
      setIsCreating(false)
      setNewPost({
        title: "",
        excerpt: "",
        content: "",
        category: "Affiliate Strategy",
        readTimeMinutes: 5,
        coverImage: "",
        images: [],
        isPublished: true,
        socialLinks: {
          twitter: "",
          linkedin: "",
          telegram: "",
          whatsapp: "",
          youtube: "",
        },
      })

      toast({
        title: "Article Published!",
        description: `"${result.data.title}" is now active in the blog system.`,
      })

      // Prompt to broadcast to socials immediately
      setBroadcastPost(result.data)
      setIsBroadcastModalOpen(true)
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: err.message,
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
        title: post.isPublished ? "Article Un-published (Draft)" : "Article Published Live",
      })
    } catch (err: any) {
      toast({ variant: "destructive", title: "Update Failed", description: err.message })
    }
  }

  const openBroadcastStudio = (post: AdminBlogPost) => {
    setBroadcastPost(post)
    setIsBroadcastModalOpen(true)
  }

  return (
    <div className="space-y-8">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <Button
          onClick={() => setIsCreating(!isCreating)}
          size="sm"
          className="bg-gas-600 hover:bg-gas-700 text-white font-semibold gap-1.5 text-xs h-9 ml-auto shadow-sm"
        >
          <Plus className="h-4 w-4" />
          {isCreating ? "Cancel" : "Create New Article"}
        </Button>
      </div>

      {/* Creation Modal / Form */}
      {isCreating && (
        <Card className="border-gas-500/30 bg-card/90 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-gas-500" /> Write Strategic Article
            </CardTitle>
            <CardDescription className="text-xs">
              Publish guides with multi-image support, social thread syncing, and 1-click multi-channel broadcasting.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePost} className="space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Article Title *</label>
                <Input
                  required
                  placeholder="e.g. 5 Strategies to Scale Direct Commissions in 2026"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  className="h-10 text-sm font-semibold"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Category</label>
                  <select
                    value={newPost.category}
                    onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                    className="w-full h-10 px-3 rounded-md bg-background border border-border text-xs text-foreground"
                  >
                    <option value="Affiliate Strategy">Affiliate Strategy</option>
                    <option value="V2V Philosophy">V2V Philosophy</option>
                    <option value="Growth & Traffic">Growth & Traffic</option>
                    <option value="Product Updates">Product Updates</option>
                    <option value="Case Studies">Case Studies</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">Read Time (Minutes)</label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={newPost.readTimeMinutes}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        readTimeMinutes: parseInt(e.target.value, 10) || 5,
                      })
                    }
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Short Excerpt (SEO Summary) *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Brief 1-2 sentence summary displayed in social cards and search results..."
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                  className="w-full p-3 rounded-md bg-background border border-border text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-gas-500 leading-relaxed"
                />
              </div>

              {/* Multi-Image Uploader Studio */}
              <MultiImageUploader
                images={newPost.images}
                coverImage={newPost.coverImage}
                onChange={(imgs) => setNewPost({ ...newPost, images: imgs })}
                onSetCoverImage={(cover) => setNewPost({ ...newPost, coverImage: cover })}
                onInsertMarkdown={(snippet) =>
                  setNewPost({ ...newPost, content: newPost.content + "\n" + snippet })
                }
              />

              {/* Content Editor */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Content (Markdown supported: ## Headings, lists, quotes, images) *
                </label>
                <textarea
                  required
                  rows={10}
                  placeholder="Write article paragraphs... Use ## for headings and - for bullet points. You can also use > [!TIP] or > [!NOTE] for callout boxes."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full p-3 rounded-md bg-background border border-border text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-gas-500 leading-relaxed"
                />
              </div>

              {/* Expandable Social Links Feeding Section */}
              <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setShowSocialInputs(!showSocialInputs)}
                  className="w-full flex items-center justify-between text-xs font-bold text-foreground"
                >
                  <span className="flex items-center gap-1.5 text-gas-600 dark:text-gas-400">
                    <MessageSquare className="h-4 w-4" />
                    Feed Social Media Discussion Links ({showSocialInputs ? "Hide" : "Expand"})
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    Connect X thread, LinkedIn post, Telegram, WhatsApp chat
                  </span>
                </button>

                {showSocialInputs && (
                  <div className="pt-3 border-t border-border/50 grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                        <Twitter className="h-3 w-3 text-sky-500" /> X (Twitter) Post URL
                      </label>
                      <Input
                        type="url"
                        placeholder="https://x.com/username/status/..."
                        value={newPost.socialLinks.twitter}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            socialLinks: { ...newPost.socialLinks, twitter: e.target.value },
                          })
                        }
                        className="h-8 text-xs bg-background/80"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                        <Linkedin className="h-3 w-3 text-blue-600" /> LinkedIn Discussion URL
                      </label>
                      <Input
                        type="url"
                        placeholder="https://www.linkedin.com/feed/update/..."
                        value={newPost.socialLinks.linkedin}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            socialLinks: { ...newPost.socialLinks, linkedin: e.target.value },
                          })
                        }
                        className="h-8 text-xs bg-background/80"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                        <Send className="h-3 w-3 text-sky-400" /> Telegram Discussion Link
                      </label>
                      <Input
                        type="url"
                        placeholder="https://t.me/channel/123"
                        value={newPost.socialLinks.telegram}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            socialLinks: { ...newPost.socialLinks, telegram: e.target.value },
                          })
                        }
                        className="h-8 text-xs bg-background/80"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                        <MessageCircle className="h-3 w-3 text-emerald-500" /> WhatsApp Community Link
                      </label>
                      <Input
                        type="url"
                        placeholder="https://chat.whatsapp.com/..."
                        value={newPost.socialLinks.whatsapp}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            socialLinks: { ...newPost.socialLinks, whatsapp: e.target.value },
                          })
                        }
                        className="h-8 text-xs bg-background/80"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <label className="flex items-center gap-1 text-[11px] font-medium text-foreground">
                        <Youtube className="h-3 w-3 text-rose-500" /> YouTube Video Walkthrough URL
                      </label>
                      <Input
                        type="url"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={newPost.socialLinks.youtube}
                        onChange={(e) =>
                          setNewPost({
                            ...newPost,
                            socialLinks: { ...newPost.socialLinks, youtube: e.target.value },
                          })
                        }
                        className="h-8 text-xs bg-background/80"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newPost.isPublished}
                    onChange={(e) =>
                      setNewPost({ ...newPost, isPublished: e.target.checked })
                    }
                    className="rounded border-border text-gas-600 focus:ring-gas-500 h-4 w-4"
                  />
                  Publish immediately (Visible to public)
                </label>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gas-600 hover:bg-gas-700 text-white font-bold text-xs h-10 px-6 shadow-md shadow-gas-600/20"
                >
                  {loading ? "Publishing..." : "Save & Launch Article"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Articles Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/60 text-muted-foreground uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Article &amp; Visuals</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Telemetry</th>
                <th className="px-4 py-3 text-center">Broadcast</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 max-w-sm">
                    <div className="flex items-center gap-3">
                      {post.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-10 w-16 object-cover rounded border border-border shrink-0"
                        />
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
                              📷 {post.images.length} photos
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

                  {/* 1-Click Social Broadcast Studio trigger */}
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openBroadcastStudio(post)}
                      className="h-7 px-2.5 text-[11px] font-bold border-gas-500/30 text-gas-600 hover:bg-gas-500/10 gap-1.5 shadow-sm"
                      title="1-Click Multi-Channel Social Broadcast"
                    >
                      <Radio className="h-3 w-3 text-gas-500 animate-pulse" />
                      <span>Broadcast</span>
                    </Button>
                  </td>

                  <td className="px-4 py-3 text-right whitespace-nowrap space-x-1">
                    <Link href={`/blog/${post.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePost(post.id, post.title)}
                      className="h-7 w-7 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredPosts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-muted-foreground">
                    No articles found. Click &quot;Create New Article&quot; to write your first post.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 1-Click Social Broadcast Modal */}
      <BlogBroadcastModal
        post={
          broadcastPost
            ? {
                id: broadcastPost.id,
                title: broadcastPost.title,
                slug: broadcastPost.slug,
                excerpt: broadcastPost.excerpt,
                coverImage: broadcastPost.coverImage,
                tags: [],
                category: broadcastPost.category,
              }
            : null
        }
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />
    </div>
  )
}
