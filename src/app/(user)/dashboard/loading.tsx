export default function DashboardLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-40 bg-muted/60 rounded-xl" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted/50 rounded-xl border" />
        ))}
      </div>

      {/* Section Navigation Skeleton */}
      <div className="h-10 bg-muted/40 rounded-lg w-full max-w-md" />

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-muted/40 rounded-xl border" />
        <div className="h-64 bg-muted/40 rounded-xl border" />
      </div>
    </div>
  )
}
