"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";

// Import our new components
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { InventoryTab } from "@/components/dashboard/inventory-tab";
import { AddItemModal } from "@/components/dashboard/add-item-model";
import { EditItemModal } from "@/components/dashboard/edit-item-model";
import { DeleteConfirmationDialog } from "@/components/dashboard/delete-confirmation-dialog";
import { ProfileTab } from "@/components/dashboard/profile-tab";
import { OrdersTab } from "@/components/dashboard/orders-tab";

export default function SupplierDashboard() {
  const { user, token } = useAuth();

  // Data states
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  useEffect(() => {
    if (token && user?.role === "supplier") {
      fetchDashboardData();
    }
  }, [token, user]);

  const fetchDashboardData = async () => {
    if (!token) return; // Add this guard clause

    try {
      setLoading(true);

      // Fetch orders
      const ordersResponse = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        const supplierOrders =
          ordersData.orders?.filter(
            (order: any) => order.supplierId === user?._id
          ) || [];
        setOrders(supplierOrders);

        // Calculate stats
        const totalOrders = supplierOrders.length;
        const pendingOrders = supplierOrders.filter((order: any) =>
          ["pending", "accepted"].includes(order.status)
        ).length;
        const totalRevenue = supplierOrders
          .filter((order: any) => order.status === "delivered")
          .reduce(
            (sum: number, order: any) => sum + (order.totalAmount || 0),
            0
          );

        setStats((prev) => ({
          ...prev,
          totalOrders,
          pendingOrders,
          totalRevenue,
        }));
      }

      // Fetch inventory
      const itemsResponse = await fetch("/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        const supplierItems = itemsData.items || [];
        setInventory(supplierItems);
        setStats((prev) => ({
          ...prev,
          totalItems: supplierItems.length,
        }));
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

  const handleEditItem = (itemId: string) => {
    setEditingItemId(itemId);
    setIsEditItemModalOpen(true);
  };

  const handleDeleteItem = (item: any) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditItemModalOpen(false);
    setEditingItemId(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Loading supplier dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              stats={stats}
              orders={orders}
              inventory={inventory}
              isAddItemModalOpen={isAddItemModalOpen}
              setIsAddItemModalOpen={setIsAddItemModalOpen}
            />
          </TabsContent>

          <TabsContent value="inventory">
            <InventoryTab
              inventory={inventory}
              isAddItemModalOpen={isAddItemModalOpen}
              setIsAddItemModalOpen={setIsAddItemModalOpen}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          </TabsContent>

          {/* Other tabs can be added here as separate components */}
          <TabsContent value="orders">
            {token && (
              <OrdersTab
                orders={orders}
                token={token}
                onRefresh={fetchDashboardData}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics">
            <div className="text-center py-12">
              <p>Analytics tab - to be implemented as separate component</p>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="text-center py-12">
              <p>Reviews tab - to be implemented as separate component</p>
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <ProfileTab user={user} />
          </TabsContent>
        </Tabs>

        {/* Modals - only render when token is available */}
        {token && (
          <>
            <AddItemModal
              isOpen={isAddItemModalOpen}
              onClose={() => setIsAddItemModalOpen(false)}
              token={token}
              onSuccess={fetchDashboardData}
            />

            <EditItemModal
              isOpen={isEditItemModalOpen}
              onClose={handleCloseEditModal}
              token={token}
              itemId={editingItemId}
              onSuccess={fetchDashboardData}
            />

            <DeleteConfirmationDialog
              isOpen={isDeleteDialogOpen}
              onClose={handleCloseDeleteDialog}
              token={token}
              item={itemToDelete}
              onSuccess={fetchDashboardData}
            />
          </>
        )}
      </div>
    </div>
  );
}
