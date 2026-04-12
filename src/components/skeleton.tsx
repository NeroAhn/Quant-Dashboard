"use client";

/** Animated pulse skeleton block */
function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

/** Market Data card skeleton (6 indicators + Fear & Greed) */
export function MarketCardSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="border p-3 rounded">
          <SkeletonBlock className="h-4 w-20 mb-2" />
          <SkeletonBlock className="h-6 w-16 mb-1" />
          <SkeletonBlock className="h-4 w-12" />
        </div>
      ))}
    </div>
  );
}

/** Watchlist/Monitoring table skeleton */
export function TableSkeleton({ rows = 12 }: { rows?: number }) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b text-left">
          {["Symbol", "Price", "1D%", "RS", "MA50 Dist", "Drawdown", "Revision", "Action"].map((h) => (
            <th key={h} className="p-2 text-gray-400">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i} className="border-b">
            <td className="p-2"><SkeletonBlock className="h-4 w-12" /></td>
            <td className="p-2"><SkeletonBlock className="h-4 w-16" /></td>
            <td className="p-2"><SkeletonBlock className="h-4 w-12" /></td>
            <td className="p-2"><SkeletonBlock className="h-4 w-10" /></td>
            <td className="p-2"><SkeletonBlock className="h-4 w-14" /></td>
            <td className="p-2"><SkeletonBlock className="h-4 w-14" /></td>
            <td className="p-2"><SkeletonBlock className="h-4 w-16" /></td>
            <td className="p-2"><SkeletonBlock className="h-4 w-10" /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
