"use client";

import { Layers } from "lucide-react";
import { useMonitoring } from "@/hooks/use-monitoring";
import { StockTable } from "./StockTable";

export function MonitoringTab() {
  const monitoring = useMonitoring();

  return (
    <StockTable
      title="모니터링 리스트 (Expansion Set)"
      description="9 Additional Tickers | Secondary Monitoring Matrix"
      icon={<Layers className="text-purple-600" size={24} />}
      isPending={monitoring.isPending}
      error={monitoring.error}
      data={monitoring.data}
      defaultRows={9}
    />
  );
}
