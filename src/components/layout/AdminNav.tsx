"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Share2,
  Percent,
  Sparkles,
  Award,
  Megaphone,
  BarChart3,
  ChevronRight,
  ShieldAlert,
  BookOpen
} from "lucide-react"
import { GASLogo } from "@/components/branding/GASLogo"

export function AdminNav() {
  const pathname = usePathname()

  const adminNavItems = [
    { label: "DASHBOARD", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "USERS", href: "/admin/users", icon: Users },
    { label: "PRODUCTS", href: "/admin/products", icon: Package },
    { label: "BLOGS", href: "/admin/blogs", icon: BookOpen },
    { label: "ORDERS", href: "/admin/orders", icon: ShoppingCart },
    { label: "REFERRALS", href: "/admin/referrals", icon: Share2 },
    { label: "COMMISSIONS", href: "/admin/commissions", icon: Percent },
    { label: "CONTRIBUTIONS", href: "/admin/contributions", icon: Sparkles },
    { label: "RECOGNITION", href: "/admin/recognition", icon: Award },
    { label: "CAMPAIGNS", href: "/admin/campaigns", icon: Megaphone },
    { label: "ANALYTICS", href: "/admin/analytics", icon: BarChart3 },
  ]

  const isActive = (href: string) => {
    if (href === "/admin/dashboard") return pathname === "/admin/dashboard"
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-full md:w-64 bg-card border-r md:min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-1 pb-1">
          <GASLogo variant="compact" size="sm" href="/admin/dashboard" />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-200 text-amber-900">
          <ShieldAlert className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-bold tracking-wider">ADMIN CONTROL</span>
        </div>

        <nav className="space-y-1">
          {adminNavItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold tracking-wider transition-colors ${
                  active
                    ? "bg-gas-600 text-white font-bold shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <item.icon className={`h-4 w-4 ${active ? "text-white" : "text-gas-600"}`} />
                  {item.label}
                </div>
                {active && <ChevronRight className="h-3.5 w-3.5 opacity-80" />}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="pt-4 border-t text-[11px] text-muted-foreground px-2">
        <div>GAS™ MVP Administration</div>
        <div className="font-mono text-[10px] text-gas-700 font-semibold">V2V™ Core Governance</div>
      </div>
    </aside>
  )
}