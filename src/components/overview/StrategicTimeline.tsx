"use client";
import { Calendar } from "lucide-react";

const timeline = [
  { date: "Apr 14", event: "U.S. CPI Release", impact: "H" },
  { date: "Apr 23", event: "Tech Earnings Peak", impact: "H" },
  { date: "May 01", event: "FOMC Meeting", impact: "M" },
];

export function StrategicTimeline() {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Calendar className="text-brand-accent-blue" size={20} />
        Strategic Timeline
      </h2>
      <div className="space-y-3">
        {timeline.map((e) => (
          <div key={e.date} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded border-l-2 border-brand-accent-blue">
            <span className="font-bold">{e.date}</span>
            <span className="text-slate-600 flex-1 ml-4 truncate">{e.event}</span>
            <span className="text-[10px] font-bold text-slate-400">{e.impact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
