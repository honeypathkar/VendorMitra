"use client";

import type React from "react";

import { useState, useRef } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import * as XLSX from "xlsx";

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSuccess: () => void;
}

interface ImportItem {
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  description?: string;
  image?: string;
}

export function BulkImportModal({
  isOpen,
  onClose,
  token,
  onSuccess,
}: BulkImportModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parsedData, setParsedData] = useState<ImportItem[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = () => {
    const templateData = [
      {
        name: "Fresh Tomatoes",
        category: "vegetables",
        price: 50,
        unit: "kg",
        stock: 100,
        description: "Fresh red tomatoes",
        image: "https://example.com/tomato.jpg",
      },
      {
        name: "Basmati Rice",
        category: "grains",
        price: 80,
        unit: "kg",
        stock: 50,
        description: "Premium basmati rice",
        image: "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Items Template");
    XLSX.writeFile(wb, "bulk_import_template.xlsx");
  };

  const validateItem = (item: any, index: number): string[] => {
    const itemErrors: string[] = [];

    if (!item.name || typeof item.name !== "string") {
      itemErrors.push(`Row ${index + 2}: Name is required`);
    }

    if (!item.category || typeof item.category !== "string") {
      itemErrors.push(`Row ${index + 2}: Category is required`);
    } else {
      const validCategories = [
        "vegetables",
        "fruits",
        "grains",
        "dairy",
        "meat",
        "spices",
        "beverages",
        "other",
      ];
      if (!validCategories.includes(item.category.toLowerCase())) {
        itemErrors.push(
          `Row ${
            index + 2
          }: Invalid category. Must be one of: ${validCategories.join(", ")}`
        );
      }
    }

    if (!item.price || isNaN(Number(item.price)) || Number(item.price) <= 0) {
      itemErrors.push(`Row ${index + 2}: Valid price is required`);
    }

    if (!item.unit || typeof item.unit !== "string") {
      itemErrors.push(`Row ${index + 2}: Unit is required`);
    } else {
      const validUnits = ["kg", "g", "l", "ml", "piece", "dozen", "pack"];
      if (!validUnits.includes(item.unit.toLowerCase())) {
        itemErrors.push(
          `Row ${index + 2}: Invalid unit. Must be one of: ${validUnits.join(
            ", "
          )}`
        );
      }
    }

    if (
      item.stock === undefined ||
      isNaN(Number(item.stock)) ||
      Number(item.stock) < 0
    ) {
      itemErrors.push(`Row ${index + 2}: Valid stock quantity is required`);
    }

    return itemErrors;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrors([]);
    setParsedData([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error("Excel file is empty");
      }

      // Validate and process data
      const validationErrors: string[] = [];
      const processedItems: ImportItem[] = [];

      jsonData.forEach((row: any, index: number) => {
        const itemErrors = validateItem(row, index);
        validationErrors.push(...itemErrors);

        if (itemErrors.length === 0) {
          processedItems.push({
            name: row.name.trim(),
            category: row.category.toLowerCase().trim(),
            price: Number(row.price),
            unit: row.unit.toLowerCase().trim(),
            stock: Number(row.stock),
            description: row.description ? row.description.trim() : "",
            image: row.image ? row.image.trim() : "",
          });
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
      } else {
        setParsedData(processedItems);
        toast({
          title: "Success",
          description: `${processedItems.length} items parsed successfully`,
        });
      }
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to parse Excel file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleBulkImport = async () => {
    if (parsedData.length === 0) {
      toast({
        title: "Error",
        description: "No valid items to import",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/items/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items: parsedData }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `${result.insertedCount} items imported successfully`,
        });
        onClose();
        onSuccess();
        // Reset state
        setParsedData([]);
        setErrors([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import items");
      }
    } catch (error) {
      console.error("Error importing items:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to import items",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setParsedData([]);
    setErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Items</DialogTitle>
          <DialogDescription>
            Upload an Excel file to import multiple items at once. Download the
            template to see the required format.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
            <div className="flex items-center space-x-3">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">Download Template</p>
                <p className="text-sm text-gray-600">
                  Get the Excel template with sample data
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="excel-file">Upload Excel File</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              ref={fileInputRef}
              disabled={isUploading || isSubmitting}
            />
            {isUploading && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Processing file...</span>
              </div>
            )}
          </div>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <h4 className="font-medium text-red-800">Validation Errors</h4>
              </div>
              <ul className="text-sm text-red-700 space-y-1 max-h-32 overflow-y-auto">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview Data */}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">
                Preview ({parsedData.length} items)
              </h4>
              <div className="border rounded-lg max-h-64 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Stock</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.slice(0, 10).map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.name}
                        </TableCell>
                        <TableCell className="capitalize">
                          {item.category}
                        </TableCell>
                        <TableCell>₹{item.price}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{item.stock}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {parsedData.length > 10 && (
                  <div className="p-2 text-center text-sm text-gray-500 border-t">
                    ... and {parsedData.length - 10} more items
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBulkImport}
            disabled={
              parsedData.length === 0 || isSubmitting || errors.length > 0
            }
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Import {parsedData.length} Items
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
