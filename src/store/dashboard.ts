import { create } from "zustand";
import { persist } from "zustand/middleware";

type Tab = "overview" | "watchlist" | "monitoring" | "opp";
type SortField = "rs" | "drawdown" | "ma50Dist" | "symbol";
type SortDirection = "asc" | "desc";

interface DashboardState {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortConfig: { field: SortField; direction: SortDirection };
  setSortConfig: (field: SortField) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      activeTab: "overview",
      setActiveTab: (tab) => set({ activeTab: tab }),
      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),
      sortConfig: { field: "rs", direction: "desc" },
      setSortConfig: (field) =>
        set((state) => ({
          sortConfig: {
            field,
            direction:
              state.sortConfig.field === field &&
              state.sortConfig.direction === "desc"
                ? "asc"
                : "desc",
          },
        })),
    }),
    { name: "dashboard-preferences" }
  )
);
