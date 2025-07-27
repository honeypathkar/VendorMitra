import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Clock, DollarSign, Package } from "lucide-react"

interface StatsCardsProps {
  stats: {
    totalOrders: number
    pendingOrders: number
    totalRevenue: number
    totalItems: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
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
            {stats.totalOrders === 0 ? "No orders received yet" : "Orders received"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pendingOrders === 0 ? "No pending orders" : "Awaiting action"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Revenue earned</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalItems}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalItems === 0 ? "No items added" : "Items in catalog"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
