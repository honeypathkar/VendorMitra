"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "@/components/ui/use-toast";

interface EditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string; // Remove the possibility of null
  itemId: string | null;
  onSuccess: () => void;
}

export function EditItemModal({
  isOpen,
  onClose,
  token,
  itemId,
  onSuccess,
}: EditItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editItemData, setEditItemData] = useState({
    name: "",
    category: "",
    stock: "",
    unit: "",
    price: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    if (isOpen && itemId) {
      fetchItemData();
    }
  }, [isOpen, itemId]);

  const fetchItemData = async () => {
    if (!itemId || !token) return; // Add token check here too

    setIsLoading(true);
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        const item = data.item;
        setEditItemData({
          name: item.name || "",
          category: item.category || "",
          stock: item.stock?.toString() || "",
          unit: item.unit || "",
          price: item.price?.toString() || "",
          description: item.description || "",
          image: item.image || "",
        });
      } else {
        throw new Error("Failed to fetch item details");
      }
    } catch (error) {
      console.error("Error fetching item:", error);
      toast({
        title: "Error",
        description: "Failed to fetch item details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEditItemData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !editItemData.name ||
      !editItemData.category ||
      !editItemData.stock ||
      !editItemData.unit ||
      !editItemData.price
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editItemData.name,
          category: editItemData.category,
          stock: Number.parseInt(editItemData.stock),
          unit: editItemData.unit,
          price: Number.parseFloat(editItemData.price),
          description: editItemData.description,
          image: editItemData.image,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item updated successfully",
        });
        onClose();
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update item");
      }
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update item",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>
            Update the item details. Fill in all the required fields.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-item-name">Item Name *</Label>
                <Input
                  id="edit-item-name"
                  value={editItemData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Select
                  value={editItemData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetables">Vegetables</SelectItem>
                    <SelectItem value="fruits">Fruits</SelectItem>
                    <SelectItem value="grains">Grains</SelectItem>
                    <SelectItem value="dairy">Dairy</SelectItem>
                    <SelectItem value="meat">Meat</SelectItem>
                    <SelectItem value="spices">Spices</SelectItem>
                    <SelectItem value="beverages">Beverages</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-price">Price (₹) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editItemData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="Enter price"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-unit">Unit *</Label>
                <Select
                  value={editItemData.unit}
                  onValueChange={(value) => handleInputChange("unit", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="g">Gram (g)</SelectItem>
                    <SelectItem value="l">Liter (l)</SelectItem>
                    <SelectItem value="ml">Milliliter (ml)</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="dozen">Dozen</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-stock">Stock Quantity *</Label>
                <Input
                  id="edit-stock"
                  type="number"
                  min="0"
                  value={editItemData.stock}
                  onChange={(e) => handleInputChange("stock", e.target.value)}
                  placeholder="Enter stock quantity"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  type="url"
                  value={editItemData.image}
                  onChange={(e) => handleInputChange("image", e.target.value)}
                  placeholder="Enter image URL (optional)"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editItemData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Enter item description (optional)"
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Item"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
