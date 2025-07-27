"use client";

import { PriceTrendsDashboard } from "@/components/analytics/price-trends-dashboard";

interface AnalyticsTabProps {
  user: any;
  token: string;
}

export function AnalyticsTab({ user, token }: AnalyticsTabProps) {
  return <PriceTrendsDashboard user={user} token={token} />;
}
