"use client";

import { useWatchlist } from "@/hooks/use-watchlist";
import { useMonitoring } from "@/hooks/use-monitoring";
import { useMarketData } from "@/hooks/use-market-data";
import { MarketCardSkeleton, TableSkeleton } from "@/components/skeleton";

export default function Home() {
  const watchlist = useWatchlist();
  const monitoring = useMonitoring();
  const marketData = useMarketData();

  return (
    <main className="min-h-screen bg-[#F8FAFC] p-8 font-mono">
      <h1 className="text-2xl font-bold text-[#1E293B] mb-6">
        Alpha Engine — Data Pipeline Verification
      </h1>

      {/* DATA-08: data update timestamp display */}
      <div className="mb-8 text-sm text-gray-500">
        {watchlist.dataUpdatedAt && (
          <p>
            Watchlist updated:{" "}
            {new Date(watchlist.dataUpdatedAt).toLocaleTimeString("ko-KR")}
          </p>
        )}
        {marketData.dataUpdatedAt && (
          <p>
            Market Data updated:{" "}
            {new Date(marketData.dataUpdatedAt).toLocaleTimeString("ko-KR")}
          </p>
        )}
      </div>

      {/* Market Data section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-2">Market Data</h2>
        {/* DATA-07: Skeleton UI during initial load */}
        {marketData.isPending && <MarketCardSkeleton />}
        {marketData.error && (
          <p className="text-red-500">Error: {marketData.error.message}</p>
        )}
        {marketData.data && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {marketData.data.data.map((item) => (
              <div key={item.symbol} className="border p-3 rounded">
                <p className="font-bold">{item.name}</p>
                <p>{item.price ?? "N/A"}</p>
                <p
                  className={
                    item.changePercent && item.changePercent >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {item.changePercent != null
                    ? `${item.changePercent.toFixed(2)}%`
                    : "N/A"}
                </p>
                {item.error && (
                  <p className="text-red-400 text-xs">{item.error}</p>
                )}
              </div>
            ))}
            {marketData.data.fearGreed && (
              <div className="border p-3 rounded">
                <p className="font-bold">Fear & Greed</p>
                <p>{marketData.data.fearGreed.display}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Watchlist section */}
      <section className="mb-8">
        <h2 className="text-lg font-bold mb-2">Watchlist (12)</h2>
        {/* DATA-07: Skeleton UI during initial load */}
        {watchlist.isPending && <TableSkeleton rows={12} />}
        {watchlist.error && (
          <p className="text-red-500">Error: {watchlist.error.message}</p>
        )}
        {watchlist.data && (
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left">
                <th className="p-2">Symbol</th>
                <th className="p-2">Price</th>
                <th className="p-2">1D%</th>
                <th className="p-2">RS</th>
                <th className="p-2">MA50 Dist</th>
                <th className="p-2">Drawdown</th>
                <th className="p-2">Revision</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.data.data.map((item) => (
                <tr key={item.symbol} className="border-b">
                  <td className="p-2 font-bold">{item.symbol}</td>
                  {"error" in item && !("price" in item) ? (
                    <td colSpan={7} className="p-2 text-red-400">
                      {item.error}
                    </td>
                  ) : (
                    <>
                      <td className="p-2">
                        {"price" in item ? item.price : "N/A"}
                      </td>
                      <td className="p-2">
                        {"change1D" in item && item.change1D != null
                          ? `${item.change1D.toFixed(2)}%`
                          : "N/A"}
                      </td>
                      <td className="p-2">
                        {"rs" in item ? item.rs.toFixed(1) : "N/A"}
                      </td>
                      <td className="p-2">
                        {"ma50Dist" in item
                          ? `${item.ma50Dist.toFixed(2)}%`
                          : "N/A"}
                      </td>
                      <td className="p-2">
                        {"drawdown" in item
                          ? `${item.drawdown.toFixed(2)}%`
                          : "N/A"}
                      </td>
                      <td className="p-2">
                        {"revision" in item ? item.revision : "N/A"}
                      </td>
                      <td className="p-2 font-bold">
                        {"action" in item ? item.action : "N/A"}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Monitoring section */}
      <section>
        <h2 className="text-lg font-bold mb-2">Monitoring (9)</h2>
        {/* DATA-07: Skeleton UI during initial load */}
        {monitoring.isPending && <TableSkeleton rows={9} />}
        {monitoring.error && (
          <p className="text-red-500">Error: {monitoring.error.message}</p>
        )}
        {monitoring.data && (
          <p className="text-sm text-gray-600">
            {monitoring.data.data.length} items loaded — Timestamp:{" "}
            {monitoring.data.timestamp}
          </p>
        )}
      </section>
    </main>
  );
}
