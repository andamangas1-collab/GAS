import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { RecognitionService } from "@/lib/services/recognition.service"

export const dynamic = "force-dynamic"

// GET /api/recognition - Retrieve authenticated user's recognition summary
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const summary = await RecognitionService.getUserRecognitionSummary(session.user.id)
    return NextResponse.json({ success: true, ...summary })
  } catch (error) {
    console.error("[API_RECOGNITION_GET_ERROR]", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
