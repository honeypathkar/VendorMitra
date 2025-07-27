"use client";

import type React from "react";

import { useState } from "react";
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

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string; // Remove the possibility of null
  onSuccess: () => void;
}

export function AddItemModal({
  isOpen,
  onClose,
  token,
  onSuccess,
}: AddItemModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    stock: "",
    unit: "",
    price: "",
    description: "",
    image: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setNewItem((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !newItem.name ||
      !newItem.category ||
      !newItem.stock ||
      !newItem.unit ||
      !newItem.price
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
      const response = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newItem.name,
          category: newItem.category,
          stock: Number.parseInt(newItem.stock),
          unit: newItem.unit,
          price: Number.parseFloat(newItem.price),
          description: newItem.description,
          image: newItem.image,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item added successfully",
        });
        onClose();
        setNewItem({
          name: "",
          category: "",
          stock: "",
          unit: "",
          price: "",
          description: "",
          image: "",
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add item");
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to add item",
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
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory. Fill in all the required fields.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="item-name">Item Name *</Label>
              <Input
                id="item-name"
                value={newItem.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter item name"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={newItem.category}
                onValueChange={(value) => handleInputChange("category", value)}
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
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={newItem.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="Enter price"
                required
              />
            </div>
            <div>
              <Label htmlFor="unit">Unit *</Label>
              <Select
                value={newItem.unit}
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
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={newItem.stock}
                onChange={(e) => handleInputChange("stock", e.target.value)}
                placeholder="Enter stock quantity"
                required
              />
            </div>
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                type="url"
                value={newItem.image}
                onChange={(e) => handleInputChange("image", e.target.value)}
                placeholder="Enter image URL (optional)"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newItem.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
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
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
