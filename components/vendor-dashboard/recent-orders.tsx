"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";

interface RecentOrdersProps {
  orders: any[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>Your latest order activity</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p>No orders yet</p>
            <p className="text-sm">Start by placing your first order</p>
            <Button
              className="mt-4"
              onClick={() => {
                // Create and dispatch a custom event to switch tabs
                const event = new CustomEvent("switchTab", { detail: "order" });
                window.dispatchEvent(event);
              }}
            >
              Place Order
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.slice(0, 5).map((order: any) => (
              <div
                key={order._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-medium">Order #{order.orderId}</p>
                  <p className="text-sm text-gray-600">
                    {order.items?.map((item: any) => item.name).join(", ") ||
                      "Items"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{order.totalAmount}</p>
                  <Badge
                    variant={
                      order.status === "delivered"
                        ? "default"
                        : order.status === "preparing"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
