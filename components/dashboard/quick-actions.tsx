"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Eye, TrendingUp, Package, Star } from "lucide-react";

interface QuickActionsProps {
  inventory: any[];
  orders: any[];
  isAddItemModalOpen: boolean;
  setIsAddItemModalOpen: (open: boolean) => void;
}

export function QuickActions({
  inventory,
  orders,
  isAddItemModalOpen,
  setIsAddItemModalOpen,
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Dialog
            open={isAddItemModalOpen}
            onOpenChange={setIsAddItemModalOpen}
          >
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </DialogTrigger>
          </Dialog>
          <Button
            variant="outline"
            className="w-full bg-transparent"
            onClick={() =>
              (
                document.querySelector('[value="orders"]') as HTMLElement
              )?.click()
            }
          >
            <Eye className="h-4 w-4 mr-2" />
            View All Orders
          </Button>
          <Button variant="outline" className="w-full bg-transparent">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Analytics
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Inventory Status</CardTitle>
          <CardDescription>Your current stock</CardDescription>
        </CardHeader>
        <CardContent>
          {inventory.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No items in inventory</p>
              <Dialog
                open={isAddItemModalOpen}
                onOpenChange={setIsAddItemModalOpen}
              >
                <DialogTrigger asChild>
                  <Button size="sm" className="mt-2">
                    Add Items
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Items</span>
                <span>{inventory.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>In Stock</span>
                <span>
                  {
                    inventory.filter((item: any) => (item.stock || 0) > 0)
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Low Stock</span>
                <span>
                  {
                    inventory.filter((item: any) => (item.stock || 0) < 10)
                      .length
                  }
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
          <CardDescription>Your business metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Rating</span>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span>4.5</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span>Orders Completed</span>
              <span>
                {orders.filter((o: any) => o.status === "delivered").length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Response Time</span>
              <span>2 hours</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
