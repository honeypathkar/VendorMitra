"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CartItem {
  itemId: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  total: number;
}

interface QuickOrderTabProps {
  suppliers: any[];
  selectedSupplier: any;
  setSelectedSupplier: (supplier: any) => void;
  token?: string;
  placeOrder: (
    supplierId: string,
    items: any[],
    deliveryAddress?: string
  ) => Promise<any>;
  fetchDashboardData: () => void;
}

export function QuickOrderTab({
  suppliers,
  selectedSupplier,
  setSelectedSupplier,
  token,
  placeOrder,
  fetchDashboardData,
}: QuickOrderTabProps) {
  const [supplierItems, setSupplierItems] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Fetch items when supplier is selected
  useEffect(() => {
    if (selectedSupplier && token) {
      fetchSupplierItems(selectedSupplier._id);
    } else {
      setSupplierItems([]);
    }
  }, [selectedSupplier, token]);

  const fetchSupplierItems = async (supplierId: string) => {
    if (!token) return;

    setIsLoadingItems(true);
    try {
      const response = await fetch(`/api/suppliers/${supplierId}/items`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSupplierItems(data.items || []);
      } else {
        console.error("Failed to fetch supplier items");
        toast({
          title: "Error",
          description: "Failed to fetch supplier items",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching supplier items:", error);
      toast({
        title: "Error",
        description: "Failed to fetch supplier items",
        variant: "destructive",
      });
    } finally {
      setIsLoadingItems(false);
    }
  };

  const addToCart = (item: any, quantity: number) => {
    if (quantity <= 0) return;

    const existingItemIndex = cart.findIndex(
      (cartItem) => cartItem.itemId === item._id
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      updatedCart[existingItemIndex].total =
        updatedCart[existingItemIndex].quantity * item.price;
      setCart(updatedCart);
    } else {
      // Add new item to cart
      const cartItem: CartItem = {
        itemId: item._id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        quantity,
        total: quantity * item.price,
      };
      setCart([...cart, cartItem]);
    }

    toast({
      title: "Added to Cart",
      description: `${quantity} ${item.unit} of ${item.name} added to cart`,
    });
  };

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    const updatedCart = cart.map((item) =>
      item.itemId === itemId
        ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
        : item
    );
    setCart(updatedCart);
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((item) => item.itemId !== itemId));
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const handlePlaceOrder = async () => {
    console.log("🚀 Place Order clicked!");
    console.log("Selected Supplier:", selectedSupplier);
    console.log("Cart:", cart);
    console.log("Delivery Address:", deliveryAddress);
    console.log("Token:", token ? "Present" : "Missing");

    // Validation
    if (!selectedSupplier) {
      toast({
        title: "Error",
        description: "Please select a supplier",
        variant: "destructive",
      });
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to cart",
        variant: "destructive",
      });
      return;
    }

    if (!deliveryAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a delivery address",
        variant: "destructive",
      });
      return;
    }

    if (!token) {
      toast({
        title: "Error",
        description: "Authentication required",
        variant: "destructive",
      });
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Prepare order items
      const orderItems = cart.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
      }));

      console.log("📦 Order Items:", orderItems);
      console.log("🏪 Supplier ID:", selectedSupplier._id);
      console.log("📍 Delivery Address:", deliveryAddress);

      // Call the placeOrder function directly with proper error handling
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          supplierId: selectedSupplier._id,
          items: orderItems,
          deliveryAddress: deliveryAddress.trim(),
          paymentMethod: "cash",
        }),
      });

      console.log("📡 API Response Status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Order Success:", result);

        toast({
          title: "Success! 🎉",
          description: `Order ${
            result.order?.orderId || "placed"
          } successfully!`,
        });

        // Clear cart and reset form on success
        setCart([]);
        setDeliveryAddress("");
        setSelectedSupplier(null);
        setSupplierItems([]);

        // Refresh dashboard data
        if (fetchDashboardData) {
          fetchDashboardData();
        }
      } else {
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);

        toast({
          title: "Order Failed",
          description: errorData.error || "Failed to place order",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("💥 Network Error:", error);
      toast({
        title: "Network Error",
        description: "Failed to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier Selection and Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick Order</CardTitle>
              <CardDescription>
                Select supplier and add items to your cart
              </CardDescription>
            </CardHeader>
            <CardContent>
              {suppliers.length === 0 ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Suppliers Available
                  </h3>
                  <p className="text-gray-500">
                    Wait for suppliers to register in your area to start
                    ordering.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="supplier-select">Select Supplier</Label>
                    <Select
                      value={selectedSupplier?._id || ""}
                      onValueChange={(value) => {
                        const supplier = suppliers.find(
                          (s: any) => s._id === value
                        );
                        console.log("🏪 Selected Supplier:", supplier);
                        setSelectedSupplier(supplier);
                        setCart([]); // Clear cart when changing supplier
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((supplier: any) => (
                          <SelectItem key={supplier._id} value={supplier._id}>
                            <div>
                              <p className="font-medium">
                                {supplier.businessName || supplier.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {supplier.businessType}
                              </p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSupplier && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Available Items</h3>
                        <Badge variant="outline">
                          {supplierItems.length} items available
                        </Badge>
                      </div>

                      {isLoadingItems ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-500">
                            Loading items...
                          </p>
                        </div>
                      ) : supplierItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <p>No items available from this supplier</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {supplierItems.map((item: any) => (
                            <ItemCard
                              key={item._id}
                              item={item}
                              onAddToCart={addToCart}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Cart ({cart.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.itemId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          ₹{item.price}/{item.unit}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateCartItemQuantity(
                              item.itemId,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateCartItemQuantity(
                              item.itemId,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.itemId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between font-medium">
                      <span>Total: ₹{getTotalAmount().toLocaleString()}</span>
                    </div>

                    <div>
                      <Label htmlFor="delivery-address">
                        Delivery Address *
                      </Label>
                      <Textarea
                        id="delivery-address"
                        placeholder="Enter your complete delivery address..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <Button
                      onClick={handlePlaceOrder}
                      disabled={
                        isPlacingOrder ||
                        cart.length === 0 ||
                        !deliveryAddress.trim()
                      }
                      className="w-full"
                      size="lg"
                    >
                      {isPlacingOrder ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Placing Order...
                        </>
                      ) : (
                        `Place Order (₹${getTotalAmount().toLocaleString()})`
                      )}
                    </Button>

                    {/* Debug Info */}
                    <div className="text-xs text-gray-500 space-y-1">
                      <p>Debug Info:</p>
                      <p>• Supplier: {selectedSupplier ? "✅" : "❌"}</p>
                      <p>• Cart Items: {cart.length}</p>
                      <p>• Address: {deliveryAddress.trim() ? "✅" : "❌"}</p>
                      <p>• Token: {token ? "✅" : "❌"}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Separate component for item cards
function ItemCard({
  item,
  onAddToCart,
}: {
  item: any;
  onAddToCart: (item: any, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    console.log("🛒 Adding to cart:", { item: item.name, quantity });
    onAddToCart(item, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  return (
    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium">{item.name}</h4>
          <p className="text-sm text-gray-600 capitalize">{item.category}</p>
          {item.description && (
            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
          )}
        </div>
        <div className="text-right">
          <p className="font-medium">
            ₹{item.price}/{item.unit}
          </p>
          <Badge
            variant={item.stock > 0 ? "default" : "secondary"}
            className="text-xs"
          >
            {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
          </Badge>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          placeholder="Qty"
          className="w-20"
          min="1"
          max={item.stock}
          value={quantity}
          onChange={(e) =>
            setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))
          }
          disabled={item.stock === 0}
        />
        <Button size="sm" onClick={handleAddToCart} disabled={item.stock === 0}>
          Add to Cart
        </Button>
      </div>
    </div>
  );
}
