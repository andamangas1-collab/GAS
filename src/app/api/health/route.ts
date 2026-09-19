import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test DB connectivity
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        database: "connected",
        app: "running",
      },
      version: "0.1.0",
    })
  } catch {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        services: {
          database: "disconnected",
          app: "running",
        },
      },
      { status: 503 }
    )
  }
}
