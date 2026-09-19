import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RecognitionService } from "@/lib/services/recognition.service"
import RecognitionClient from "./RecognitionClient"

export const dynamic = "force-dynamic"

export default async function RecognitionPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login?callbackUrl=/recognition")
  }

  const [summary, levels] = await Promise.all([
    RecognitionService.getUserRecognitionSummary(session.user.id),
    RecognitionService.getRecognitionLevels(),
  ])

  return (
    <RecognitionClient
      initialSummary={summary}
      allLevels={levels}
    />
  )
}
