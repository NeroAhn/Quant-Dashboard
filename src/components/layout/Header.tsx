"use client";
import { Target } from "lucide-react";

interface HeaderProps {
  lastUpdated: string;
}

export function Header({ lastUpdated }: HeaderProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-primary flex items-center gap-2">
        <Target className="text-brand-accent-blue" />
        Quant Strategist Pro Dashboard
      </h1>
      <p className="text-slate-500 mt-1">
        18Y Senior Macro Strategy Framework | {lastUpdated}
      </p>
    </div>
  );
}
