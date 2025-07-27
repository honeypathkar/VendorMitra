"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, CheckCircle, XCircle, Truck, Package } from "lucide-react";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

interface OrdersTabProps {
  orders: any[];
  token: string;
  onRefresh: () => void;
}

export function OrdersTab({ orders, token, onRefresh }: OrdersTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Order status updated successfully",
        });
        onRefresh(); // Refresh the orders data
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update order status",
        variant: "destructive",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "delivered":
        return "default";
      case "preparing":
      case "accepted":
        return "secondary";
      case "out_for_delivery":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-green-600";
      case "preparing":
      case "accepted":
        return "text-blue-600";
      case "out_for_delivery":
        return "text-orange-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items?.some((item: any) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Order Management</h2>
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Search orders..."
            className="w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="preparing">Preparing</SelectItem>
              <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {orders.length === 0
                  ? "No Orders"
                  : "No orders match your search"}
              </h3>
              <p className="text-gray-500">
                {orders.length === 0
                  ? "Orders from vendors will appear here."
                  : "Try adjusting your search or filter criteria."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  {/* <TableHead>Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order: any) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">
                      {order.orderId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">Vendor</p>
                        <p className="text-sm text-gray-500">
                          ID: {order.vendorId}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="font-medium">
                          {order.items?.length || 0} item
                          {(order.items?.length || 0) !== 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {order.items
                            ?.map(
                              (item: any) => `${item.name} (${item.quantity})`
                            )
                            .join(", ") || "No items"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          ₹{order.totalAmount?.toLocaleString() || 0}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {order.paymentMethod || "Cash"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(order.status)}
                        className="capitalize"
                      >
                        {order.status?.replace("_", " ") || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {/* <Button
                          size="sm"
                          variant="outline"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button> */}

                        {order.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                updateOrderStatus(order._id, "accepted")
                              }
                              disabled={updatingOrderId === order._id}
                              title="Accept Order"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateOrderStatus(order._id, "cancelled")
                              }
                              disabled={updatingOrderId === order._id}
                              title="Cancel Order"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        {order.status === "accepted" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order._id, "preparing")
                            }
                            disabled={updatingOrderId === order._id}
                            title="Start Preparing"
                          >
                            <Package className="h-4 w-4 mr-1" />
                            Prepare
                          </Button>
                        )}

                        {order.status === "preparing" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order._id, "out_for_delivery")
                            }
                            disabled={updatingOrderId === order._id}
                            title="Mark Out for Delivery"
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Ship
                          </Button>
                        )}

                        {order.status === "out_for_delivery" && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateOrderStatus(order._id, "delivered")
                            }
                            disabled={updatingOrderId === order._id}
                            title="Mark as Delivered"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Deliver
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Order Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {orders.filter((o) => o.status === "pending").length}
              </p>
              <p className="text-sm text-gray-600">Pending Orders</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {
                  orders.filter((o) =>
                    ["accepted", "preparing", "out_for_delivery"].includes(
                      o.status
                    )
                  ).length
                }
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {orders.filter((o) => o.status === "delivered").length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {orders.filter((o) => o.status === "cancelled").length}
              </p>
              <p className="text-sm text-gray-600">Cancelled</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
