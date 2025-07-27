"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { OverviewTab } from "@/components/vendor-dashboard/tabs/overview-tabs";
import { QuickOrderTab } from "@/components/vendor-dashboard/tabs/quick-order-tabs";
import { SuppliersTab } from "@/components/vendor-dashboard/tabs/supplier-tabs";
import { OrdersTab } from "@/components/vendor-dashboard/tabs/order-tabs";
import { ProfileTab } from "@/components/vendor-dashboard/tabs/profile-tabs";
import { LoadingSpinner } from "@/components/vendor-dashboard/loading-spinner";
import Navigation from "@/components/navigation";
import { AnalyticsTab } from "@/components/vendor-dashboard/tabs/analytics-tabs";

export default function VendorDashboard() {
  const { user, token } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [voiceOrder, setVoiceOrder] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  // Dynamic data states
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "vendor" && token) {
      fetchDashboardData();
    }
  }, [user, token]);

  const fetchDashboardData = async () => {
    if (!token) return;

    try {
      setLoading(true);

      // Fetch suppliers
      const suppliersResponse = await fetch("/api/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (suppliersResponse.ok) {
        const suppliersData = await suppliersResponse.json();
        setSuppliers(suppliersData.suppliers || []);
      } else {
        console.error("Failed to fetch suppliers");
      }

      // Fetch orders
      const ordersResponse = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        const vendorOrders = ordersData.orders || [];
        setOrders(vendorOrders);

        // Calculate stats from real data
        const totalOrders = vendorOrders.length;
        const activeOrders = vendorOrders.filter((order: any) =>
          ["pending", "accepted", "preparing", "out_for_delivery"].includes(
            order.status
          )
        ).length;
        const totalSpent = vendorOrders
          .filter((order: any) => order.status === "delivered")
          .reduce(
            (sum: number, order: any) => sum + (order.totalAmount || 0),
            0
          );
        const avgOrderValue =
          totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

        setStats({
          totalOrders,
          activeOrders,
          totalSpent,
          avgOrderValue,
        });
      } else {
        console.error("Failed to fetch orders");
      }

      // Fetch items from all suppliers
      const itemsResponse = await fetch("/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setItems(itemsData.items || []);
      } else {
        console.error("Failed to fetch items");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleTabSwitch = (event: any) => {
      const tabValue = event.detail;
      // Find the tab trigger and click it
      const tabTrigger = document.querySelector(
        `[value="${tabValue}"]`
      ) as HTMLElement;
      if (tabTrigger) {
        tabTrigger.click();
      }
    };

    window.addEventListener("switchTab", handleTabSwitch);
    return () => {
      window.removeEventListener("switchTab", handleTabSwitch);
    };
  }, []);

  const startVoiceRecording = () => {
    setIsRecording(true);
    // Voice recording logic would go here
    setTimeout(() => {
      setIsRecording(false);
      setVoiceOrder(
        "I need 5 kg tomatoes, 2 kg onions, and 1 liter cooking oil"
      );
    }, 3000);
  };

  const processVoiceOrder = async () => {
    if (!voiceOrder.trim()) return;

    try {
      // Simulate processing voice order
      console.log("Processing voice order:", voiceOrder);

      // Mock successful processing
      setTimeout(() => {
        setVoiceOrder("");
        toast({
          title: "Success",
          description: "Voice order processed successfully",
        });
      }, 1000);
    } catch (error) {
      console.error("Error processing voice order:", error);
      toast({
        title: "Error",
        description: "Failed to process voice order",
        variant: "destructive",
      });
    }
  };

  // Simplified placeOrder function - just for compatibility
  const placeOrder = async (
    supplierId: string,
    orderItems: any[],
    deliveryAddress?: string
  ) => {
    // This is now handled directly in QuickOrderTab
    return Promise.resolve();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const dashboardProps = {
    user,
    token: token || undefined, // Convert null to undefined
    orders,
    suppliers,
    items,
    stats,
    isRecording,
    voiceOrder,
    selectedSupplier,
    setSelectedSupplier,
    startVoiceRecording,
    processVoiceOrder,
    setVoiceOrder,
    placeOrder,
    fetchDashboardData,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="order">Quick Order</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
            <TabsTrigger value="orders">My Orders</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab {...dashboardProps} />
          </TabsContent>

          <TabsContent value="order">
            <QuickOrderTab {...dashboardProps} />
          </TabsContent>

          <TabsContent value="suppliers">
            <SuppliersTab suppliers={suppliers} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab
              orders={orders}
              token={token || undefined}
              onRefresh={fetchDashboardData}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab user={user} token={token || ""} />
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
