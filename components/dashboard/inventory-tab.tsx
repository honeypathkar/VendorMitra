"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package, Upload } from "lucide-react";
import { useState } from "react";
import { BulkImportModal } from "./bulk-import-modal";

interface InventoryTabProps {
  inventory: any[];
  isAddItemModalOpen: boolean;
  setIsAddItemModalOpen: (open: boolean) => void;
  onEditItem: (itemId: string) => void;
  onDeleteItem: (item: any) => void;
  token: string;
  onRefresh: () => void;
}

export function InventoryTab({
  inventory,
  isAddItemModalOpen,
  setIsAddItemModalOpen,
  onEditItem,
  onDeleteItem,
  token,
  onRefresh,
}: InventoryTabProps) {
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsBulkImportModalOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Bulk Import
          </Button>
          <Dialog
            open={isAddItemModalOpen}
            onOpenChange={setIsAddItemModalOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Item
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          {inventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Items
              </h3>
              <p className="text-gray-500 mb-4">
                Add items to your inventory to start selling.
              </p>
              <div className="flex justify-center space-x-2">
                <Dialog
                  open={isAddItemModalOpen}
                  onOpenChange={setIsAddItemModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Item
                    </Button>
                  </DialogTrigger>
                </Dialog>
                <Button
                  variant="outline"
                  onClick={() => setIsBulkImportModalOpen(true)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Import
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item: any) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="capitalize">
                      {item.category}
                    </TableCell>
                    <TableCell>₹{item.price}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.stock || 0}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          (item.stock || 0) > 0 ? "default" : "secondary"
                        }
                      >
                        {(item.stock || 0) > 0 ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditItem(item._id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onDeleteItem(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Bulk Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        token={token}
        onSuccess={onRefresh}
      />
    </div>
  );
}
