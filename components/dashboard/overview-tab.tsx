import { StatsCards } from "./stats-cards";
import { RecentOrders } from "./recent-orders";
import { QuickActions } from "./quick-actions";

interface OverviewTabProps {
  stats: {
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    totalItems: number;
  };
  orders: any[];
  inventory: any[];
  isAddItemModalOpen: boolean;
  setIsAddItemModalOpen: (open: boolean) => void;
}

export function OverviewTab({
  stats,
  orders,
  inventory,
  isAddItemModalOpen,
  setIsAddItemModalOpen,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      <RecentOrders orders={orders} />
      <QuickActions
        inventory={inventory}
        orders={orders}
        isAddItemModalOpen={isAddItemModalOpen}
        setIsAddItemModalOpen={setIsAddItemModalOpen}
      />
    </div>
  );
}
