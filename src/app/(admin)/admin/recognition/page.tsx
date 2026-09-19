import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { RecognitionService } from "@/lib/services/recognition.service"
import AdminRecognitionClient from "./AdminRecognitionClient"

export const dynamic = "force-dynamic"

export default async function AdminRecognitionPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login?callbackUrl=/admin/recognition")
  }

  const [rules, levels] = await Promise.all([
    RecognitionService.getPointRules(),
    RecognitionService.getRecognitionLevels(),
  ])

  return (
    <AdminRecognitionClient
      initialRules={rules}
      initialLevels={levels}
    />
  )
}