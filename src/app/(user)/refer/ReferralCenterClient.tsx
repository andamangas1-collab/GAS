"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Share2,
  Copy,
  Check,
  MousePointerClick,
  Users,
  Award,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Shield
} from "lucide-react"

interface ReferralItem {
  id: string
  status: string
  clickedAt: string | Date | null
  registeredAt: string | Date | null
  qualifiedAt: string | Date | null
  createdAt: string | Date
  isSelfReferral: boolean
  isFlagged: boolean
  flagReason: string | null
  referred: {
    email: string
    profile: {
      firstName: string
      lastName: string
    } | null
  }
  order: {
    id: string
    totalAmount: string | number
  } | null
  commissions: Array<{
    amount: string | number
    status: string
  }>
}

export default function ReferralCenterClient({
  referralCode,
  totalClicks,
  referrals,
}: {
  referralCode: string
  totalClicks: number
  referrals: ReferralItem[]
}) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  const shortLink = `http://localhost:3000/r/${referralCode}`
  const fullLink = `http://localhost:3000/register?ref=${referralCode}`

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopiedLink(type)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const registeredCount = referrals.length
  const qualifiedCount = referrals.filter((r) => r.status === "QUALIFIED").length
  const totalEarned = referrals.reduce((sum, r) => {
    const commTotal = r.commissions.reduce((cSum, c) => cSum + Number(c.amount), 0)
    return sum + commTotal
  }, 0)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Affiliate Referral Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share your verified referral identifier to onboard community members and earn eligible direct commissions.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-gas-50 border border-gas-200 px-3 py-1.5 rounded-full text-xs text-gas-800 font-semibold">
          <ShieldCheck className="h-4 w-4 text-gas-600" /> Direct Referral Only (Single-Tier)
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="border-blue-200 bg-blue-50/40">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-blue-700 tracking-wider">
                Total Clicks
              </span>
              <MousePointerClick className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold text-blue-900 mt-1">{totalClicks}</div>
          </CardContent>
        </Card>

        <Card className="border-gas-200 bg-gas-50/40">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-gas-700 tracking-wider">
                Attributed
              </span>
              <Users className="h-4 w-4 text-gas-600" />
            </div>
            <div className="text-xl font-bold text-gas-900 mt-1">{registeredCount}</div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/40">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-emerald-700 tracking-wider">
                Qualified
              </span>
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="text-xl font-bold text-emerald-900 mt-1">{qualifiedCount}</div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/40">
          <CardContent className="p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-amber-700 tracking-wider">
                Commissions
              </span>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </div>
            <div className="text-xl font-bold text-amber-900 mt-1">₹{totalEarned.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Share Links Card */}
      <Card className="bg-gradient-to-r from-gas-50 to-emerald-50 border-gas-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-gas-900 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-gas-600" /> Your Verified Referral Links
          </CardTitle>
          <CardDescription className="text-xs text-gas-700">
            When visitors use your links, clicks are logged, a 30-day attribution cookie is stored, and new accounts are attributed to your ledger.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-gas-900 flex items-center justify-between">
              <span>Short Tracking Link</span>
              <span className="text-muted-foreground font-normal">Redirects & logs click event</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={shortLink}
                className="w-full font-mono text-xs p-2.5 rounded-md border bg-white text-gas-900 font-semibold"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(shortLink, "short")}
                className="shrink-0 text-xs font-semibold gap-1 bg-white hover:bg-gas-50"
              >
                {copiedLink === "short" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-gas-900 flex items-center justify-between">
              <span>Direct Registration Link</span>
              <span className="text-muted-foreground font-normal">Pre-fills your referral code</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={fullLink}
                className="w-full font-mono text-xs p-2.5 rounded-md border bg-white text-gas-900 font-semibold"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(fullLink, "full")}
                className="shrink-0 text-xs font-semibold gap-1 bg-white hover:bg-gas-50"
              >
                {copiedLink === "full" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="p-2.5 bg-white/80 rounded-md border text-[11px] text-muted-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-gas-600 shrink-0" />
            <span>
              <strong>Zero MLM / Pyramid Guarantee:</strong> GAS™ is strictly a direct-tier affiliate system.
              You earn commissions purely on verified product purchases made by your direct invitees.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Attributed Referrals Ledger */}
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-base flex items-center justify-between">
            <span>Direct Attributed Referrals ({referrals.length})</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Complete lifecycle: Click Tracked → Registered → Purchased → Qualified → Commission Created.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {referrals.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs space-y-2">
              <Share2 className="h-8 w-8 mx-auto text-gas-500 opacity-60" />
              <div className="font-semibold">No referrals attributed yet</div>
              <p className="text-[11px] max-w-sm mx-auto">
                Share your personal link on your blog, social media, or with colleagues to build your direct affiliate network.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-3">Referred Member</th>
                    <th className="px-4 py-3">Registered At</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3 text-right">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {referrals.map((r) => {
                    const comm = r.commissions[0]
                    return (
                      <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-foreground">
                            {r.referred.profile?.firstName
                              ? `${r.referred.profile.firstName} ${r.referred.profile.lastName}`
                              : r.referred.email}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{r.referred.email}</div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-[11px]">
                          {r.registeredAt
                            ? new Date(r.registeredAt).toLocaleDateString("en-IN", { dateStyle: "medium" })
                            : new Date(r.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              r.status === "QUALIFIED"
                                ? "default"
                                : r.status === "REJECTED"
                                ? "destructive"
                                : "outline"
                            }
                            className="text-[10px]"
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          {r.order ? `#${r.order.id.slice(-6)}` : <span className="text-muted-foreground">None</span>}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          {comm ? (
                            <span className="font-bold text-gas-800 bg-gas-50 px-2 py-0.5 rounded border border-gas-200">
                              ₹{Number(comm.amount).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
