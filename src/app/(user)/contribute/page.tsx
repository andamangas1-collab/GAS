import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ContributeClient from "./ContributeClient"

export default async function ContributePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login?callbackUrl=/contribute")
  }

  const contributions = await prisma.contribution.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  return <ContributeClient initialContributions={contributions} />
}
