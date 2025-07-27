"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import {
  TrendingUp,
  Download,
  Filter,
  BarChart3,
  LineChart,
  Package,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { PriceTrendChart } from "./price-trend-chart";
import { ComparativeChart } from "./comparative-charts";
import { PriceStatistics } from "./price-statistics";
import { TrendInsights } from "./trend-insights";
import type { DateRange } from "react-day-picker";
import { subDays, subMonths, subYears } from "date-fns";

interface PriceTrendsDashboardProps {
  user: any;
  token: string;
}

interface PriceData {
  date: string;
  price: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  volume: number;
  productId: string;
  productName: string;
  category: string;
  supplierId?: string;
  supplierName?: string;
}

interface FilterState {
  products: string[];
  categories: string[];
  suppliers: string[];
  dateRange: DateRange | undefined;
  granularity: "daily" | "weekly" | "monthly";
  priceType: "actual" | "average" | "range";
}

export function PriceTrendsDashboard({
  user,
  token,
}: PriceTrendsDashboardProps) {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    products: [],
    categories: [],
    suppliers: [],
    dateRange: {
      from: subMonths(new Date(), 3),
      to: new Date(),
    },
    granularity: "daily",
    priceType: "actual",
  });

  // Access control - only vendors and admins
  const isAccessRestricted = !user || !["vendor", "admin"].includes(user.role);

  useEffect(() => {
    if (!isAccessRestricted) {
      fetchInitialData();
    }
  }, [token]);

  useEffect(() => {
    if (
      !isAccessRestricted &&
      filters.dateRange?.from &&
      filters.dateRange?.to
    ) {
      fetchPriceData();
    }
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // Fetch products, categories, and suppliers
      const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
        fetch("/api/analytics/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/analytics/categories", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/analytics/suppliers", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products || []);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      }

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData.suppliers || []);
      }

      // Fetch initial price data
      await fetchPriceData();
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceData = async () => {
    try {
      const params = new URLSearchParams({
        granularity: filters.granularity,
        priceType: filters.priceType,
        ...(filters.dateRange?.from && {
          startDate: filters.dateRange.from.toISOString(),
        }),
        ...(filters.dateRange?.to && {
          endDate: filters.dateRange.to.toISOString(),
        }),
        ...(filters.products.length > 0 && {
          products: filters.products.join(","),
        }),
        ...(filters.categories.length > 0 && {
          categories: filters.categories.join(","),
        }),
        ...(filters.suppliers.length > 0 && {
          suppliers: filters.suppliers.join(","),
        }),
      });

      const response = await fetch(`/api/analytics/price-trends?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPriceData(data.priceData || []);
      } else {
        throw new Error("Failed to fetch price data");
      }
    } catch (error) {
      console.error("Error fetching price data:", error);
      toast({
        title: "Error",
        description: "Failed to load price trend data",
        variant: "destructive",
      });
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleProductToggle = (productId: string) => {
    setFilters((prev) => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter((id) => id !== productId)
        : [...prev.products, productId],
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((cat) => cat !== category)
        : [...prev.categories, category],
    }));
  };

  const exportData = async (format: "csv" | "png") => {
    try {
      const params = new URLSearchParams({
        format,
        granularity: filters.granularity,
        priceType: filters.priceType,
        ...(filters.dateRange?.from && {
          startDate: filters.dateRange.from.toISOString(),
        }),
        ...(filters.dateRange?.to && {
          endDate: filters.dateRange.to.toISOString(),
        }),
        ...(filters.products.length > 0 && {
          products: filters.products.join(","),
        }),
        ...(filters.categories.length > 0 && {
          categories: filters.categories.join(","),
        }),
      });

      const response = await fetch(`/api/analytics/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `price-trends-${
          new Date().toISOString().split("T")[0]
        }.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Success",
          description: `Data exported as ${format.toUpperCase()}`,
        });
      }
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  if (loading || isAccessRestricted) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          {isAccessRestricted ? (
            <>
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Access Restricted
              </h3>
              <p className="text-gray-600">
                Price trend analytics are only available to vendors and
                administrators.
              </p>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading price trend analytics...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Price Trend Analytics</h1>
          <p className="text-gray-600">
            Analyze market price trends and make data-driven decisions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => exportData("csv")}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData("png")}>
            <Download className="h-4 w-4 mr-2" />
            Export Chart
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters & Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange
                date={filters.dateRange}
                onDateChange={(range) => handleFilterChange("dateRange", range)}
              />
              <div className="flex flex-wrap gap-1">
                {datePresets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleFilterChange("dateRange", preset.value())
                    }
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Granularity */}
            <div className="space-y-2">
              <Label>Data Granularity</Label>
              <Select
                value={filters.granularity}
                onValueChange={(value) =>
                  handleFilterChange("granularity", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Price Type */}
            <div className="space-y-2">
              <Label>Price Type</Label>
              <Select
                value={filters.priceType}
                onValueChange={(value) =>
                  handleFilterChange("priceType", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="actual">Actual Prices</SelectItem>
                  <SelectItem value="average">Average Prices</SelectItem>
                  <SelectItem value="range">Price Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quick Stats */}
            <div className="space-y-2">
              <Label>Quick Stats</Label>
              <div className="space-y-1">
                <div className="text-sm text-gray-600">
                  Products: {filters.products.length || "All"}
                </div>
                <div className="text-sm text-gray-600">
                  Categories: {filters.categories.length || "All"}
                </div>
                <div className="text-sm text-gray-600">
                  Data Points: {priceData.length}
                </div>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="mt-4 space-y-2">
            <Label>Select Products</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {products.map((product) => (
                <Badge
                  key={product._id}
                  variant={
                    filters.products.includes(product._id)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleProductToggle(product._id)}
                >
                  {product.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div className="mt-4 space-y-2">
            <Label>Select Categories</Label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={
                    filters.categories.includes(category)
                      ? "default"
                      : "outline"
                  }
                  className="cursor-pointer capitalize"
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <LineChart className="h-4 w-4" />
            <span>Price Trends</span>
          </TabsTrigger>
          <TabsTrigger
            value="comparative"
            className="flex items-center space-x-2"
          >
            <BarChart3 className="h-4 w-4" />
            <span>Comparative</span>
          </TabsTrigger>
          <TabsTrigger
            value="statistics"
            className="flex items-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Statistics</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Package className="h-4 w-4" />
            <span>Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends">
          <PriceTrendChart
            data={priceData}
            filters={filters}
            products={products}
          />
        </TabsContent>

        <TabsContent value="comparative">
          <ComparativeChart
            data={priceData}
            filters={filters}
            products={products}
          />
        </TabsContent>

        <TabsContent value="statistics">
          <PriceStatistics
            data={priceData}
            filters={filters}
            products={products}
          />
        </TabsContent>

        <TabsContent value="insights">
          <TrendInsights
            data={priceData}
            filters={filters}
            products={products}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const datePresets = [
  {
    label: "Last 7 days",
    value: () => ({ from: subDays(new Date(), 7), to: new Date() }),
  },
  {
    label: "Last 30 days",
    value: () => ({ from: subDays(new Date(), 30), to: new Date() }),
  },
  {
    label: "Last 90 days",
    value: () => ({ from: subDays(new Date(), 90), to: new Date() }),
  },
  {
    label: "Last 6 months",
    value: () => ({ from: subMonths(new Date(), 6), to: new Date() }),
  },
  {
    label: "Last year",
    value: () => ({ from: subYears(new Date(), 1), to: new Date() }),
  },
];
