"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User,
  LogOut,
  Settings,
  LayoutDashboard,
  ShieldCheck,
  Menu,
  X,
  BookOpen,
  ShoppingBag,
  Share2,
  Sparkles,
  Award
} from "lucide-react"
import { GASLogo } from "@/components/branding/GASLogo"

export function Header() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isLoading = status === "loading"
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN"

  const userNavLinks = [
    { label: "HOME", href: "/" },
    { label: "BLOG", href: "/blog", icon: BookOpen },
    { label: "LEARN", href: "/learn", icon: BookOpen },
    { label: "OFFERS", href: "/offers", icon: ShoppingBag },
    { label: "REFER", href: "/refer", icon: Share2, authOnly: true },
    { label: "CREATE VALUE", href: "/contribute", icon: Sparkles, authOnly: true },
    { label: "RECOGNITION", href: "/recognition", icon: Award, authOnly: true },
    { label: "PROFILE", href: "/dashboard/profile", icon: User, authOnly: true },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <GASLogo variant="compact" size="md" href="/" />

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {userNavLinks.map((link) => {
              if (link.authOnly && !session) return null
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold tracking-wider transition-colors ${
                    active
                      ? "bg-gas-50 text-gas-800 font-bold border-b-2 border-gas-600"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Action Controls & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="hidden sm:flex text-xs h-8 gap-1.5 border-amber-300 bg-amber-50/50 hover:bg-amber-100 text-amber-900 font-semibold">
                  <Link href="/admin/dashboard">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-600" /> Admin Console
                  </Link>
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full border hover:border-gas-500">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1">
                  <DropdownMenuLabel className="p-2">
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{session.user.name ?? "Member"}</span>
                      <span className="text-xs text-muted-foreground truncate">{session.user.email}</span>
                      <Badge variant="outline" className="w-fit mt-1.5 text-[10px] font-mono">
                        {session.user.role}
                      </Badge>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard" className="flex items-center gap-2 text-xs">
                      <LayoutDashboard className="h-3.5 w-3.5 text-gas-600" /> User Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/dashboard/profile" className="flex items-center gap-2 text-xs">
                      <User className="h-3.5 w-3.5 text-gas-600" /> My Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin/dashboard" className="flex items-center gap-2 text-xs text-amber-700">
                        <ShieldCheck className="h-3.5 w-3.5" /> Admin Navigation
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer text-xs flex items-center"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <LogOut className="h-3.5 w-3.5 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="text-xs font-semibold">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="bg-gas-600 hover:bg-gas-700 text-white text-xs font-semibold">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-muted text-muted-foreground focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest px-2 pt-1">
            Menu Navigation
          </div>
          <div className="flex flex-col space-y-1">
            {userNavLinks.map((link) => {
              if (link.authOnly && !session) return null
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-semibold ${
                    active ? "bg-gas-100 text-gas-800 font-bold" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {link.icon && <link.icon className="h-4 w-4 text-gas-600" />}
                  {link.label}
                </Link>
              )
            })}
          </div>

          {isAdmin && (
            <div className="pt-2 border-t mt-2">
              <div className="text-[11px] font-bold text-amber-800 uppercase tracking-widest px-2 mb-1">
                Admin Console
              </div>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold text-amber-900 bg-amber-50"
              >
                <ShieldCheck className="h-4 w-4 text-amber-600" />
                Go to Admin Dashboard
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}