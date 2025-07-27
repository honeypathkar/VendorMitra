import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Clock, TrendingUp } from "lucide-react";

interface MetricsCardsProps {
  stats: {
    totalOrders: number;
    activeOrders: number;
    totalSpent: number;
    avgOrderValue: number;
  };
}

export function MetricsCards({ stats }: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalOrders === 0 ? "No orders placed yet" : "Orders placed"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeOrders}</div>
          <p className="text-xs text-muted-foreground">
            {stats.activeOrders === 0
              ? "No active orders"
              : "Orders in progress"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ₹{stats.totalSpent.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground">Total amount spent</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{stats.avgOrderValue}</div>
          <p className="text-xs text-muted-foreground">Average per order</p>
        </CardContent>
      </Card>
    </div>
  );
}
