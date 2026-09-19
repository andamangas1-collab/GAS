"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[DASHBOARD_ERROR]", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <Card className="border-red-200 bg-red-50/50 shadow-sm text-center p-6 space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <CardContent className="space-y-2 p-0">
          <h2 className="text-lg font-bold text-red-950">Failed to Load Dashboard</h2>
          <p className="text-xs text-red-700 leading-relaxed">
            {error?.message || "An unexpected error occurred while loading your dashboard metrics. Please try again."}
          </p>
          <div className="pt-3">
            <Button
              onClick={() => reset()}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold gap-1.5 mx-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Retry Loading
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
