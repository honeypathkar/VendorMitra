"use client";

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
import { toast } from "@/components/ui/use-toast";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  item: any;
  onSuccess: () => void;
}

export function DeleteConfirmationDialog({
  isOpen,
  onClose,
  token,
  item,
  onSuccess,
}: DeleteConfirmationDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!item || !token) return; // Add token check

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/items/${item._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
        onClose();
        onSuccess();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{item?.name}"? This action cannot
            be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
