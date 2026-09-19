import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Phone, Mail, MapPin } from "lucide-react"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/profile")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true }
  })

  if (!user) redirect("/login")

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Profile & Account</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review personal information, verified identity parameters, and security status.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gas-100 text-gas-700 flex items-center justify-center font-bold text-lg">
              {user.profile?.firstName?.[0] || "U"}
            </div>
            <div>
              <CardTitle className="text-lg">
                {user.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : "Affiliate Member"}
              </CardTitle>
              <CardDescription className="text-xs font-mono">
                Member ID: {user.id}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {user.role}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 border rounded-md space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gas-600" /> Email Address
              </div>
              <div className="font-semibold text-sm">{user.email}</div>
            </div>

            <div className="p-3 border rounded-md space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gas-600" /> Mobile Number
              </div>
              <div className="font-semibold text-sm">{user.profile?.mobile || "Not specified"}</div>
            </div>

            <div className="p-3 border rounded-md space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-gas-600" /> Referral Identifier
              </div>
              <div className="font-mono font-bold text-gas-700 text-sm">{user.referralCode}</div>
            </div>

            <div className="p-3 border rounded-md space-y-1">
              <div className="text-muted-foreground flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gas-600" /> Location
              </div>
              <div className="font-semibold text-sm">
                {user.profile?.city && user.profile?.state ? `${user.profile.city}, ${user.profile.state}` : "India"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
