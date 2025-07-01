// src/components/dashboard-overview.tsx
"use client"
import { StatsCards } from "./dashboard-overview/StatsCards";
import { RecentSessions } from "./dashboard-overview/RecentSessions";
import { TopPerformers } from "./dashboard-overview/TopPerformers";
import { QuickActions } from "./dashboard-overview/QuickActions";

export function DashboardOverview() {
  return (
      <div className="space-y-6">
        <StatsCards />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentSessions />
          <TopPerformers />
        </div>
        <QuickActions />
      </div>
  );
}