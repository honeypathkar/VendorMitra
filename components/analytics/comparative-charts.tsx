"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ComparativeChartProps {
  data: any[];
  filters: any;
  products: any[];
}

export function ComparativeChart({
  data,
  filters,
  products,
}: ComparativeChartProps) {
  const [comparisonType, setComparisonType] = useState<
    "products" | "categories" | "suppliers"
  >("products");
  const [timeComparison, setTimeComparison] = useState<"current" | "previous">(
    "current"
  );

  // Process data based on comparison type
  const processComparativeData = () => {
    if (comparisonType === "products") {
      const productStats = data.reduce((acc, item) => {
        if (!acc[item.productName]) {
          acc[item.productName] = {
            name: item.productName,
            avgPrice: 0,
            minPrice: Number.POSITIVE_INFINITY,
            maxPrice: 0,
            totalVolume: 0,
            count: 0,
          };
        }

        acc[item.productName].avgPrice += item.price;
        acc[item.productName].minPrice = Math.min(
          acc[item.productName].minPrice,
          item.price
        );
        acc[item.productName].maxPrice = Math.max(
          acc[item.productName].maxPrice,
          item.price
        );
        acc[item.productName].totalVolume += item.volume || 0;
        acc[item.productName].count++;

        return acc;
      }, {});

      return Object.values(productStats).map((stat: any) => ({
        ...stat,
        avgPrice: stat.avgPrice / stat.count,
        volatility: stat.maxPrice - stat.minPrice,
      }));
    }

    if (comparisonType === "categories") {
      const categoryStats = data.reduce((acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = {
            name: item.category,
            avgPrice: 0,
            minPrice: Number.POSITIVE_INFINITY,
            maxPrice: 0,
            totalVolume: 0,
            count: 0,
          };
        }

        acc[item.category].avgPrice += item.price;
        acc[item.category].minPrice = Math.min(
          acc[item.category].minPrice,
          item.price
        );
        acc[item.category].maxPrice = Math.max(
          acc[item.category].maxPrice,
          item.price
        );
        acc[item.category].totalVolume += item.volume || 0;
        acc[item.category].count++;

        return acc;
      }, {});

      return Object.values(categoryStats).map((stat: any) => ({
        ...stat,
        avgPrice: stat.avgPrice / stat.count,
        volatility: stat.maxPrice - stat.minPrice,
      }));
    }

    return [];
  };

  const chartData = processComparativeData();
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex space-x-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Compare By</label>
          <Select
            value={comparisonType}
            onValueChange={(value: any) => setComparisonType(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="categories">Categories</SelectItem>
              <SelectItem value="suppliers">Suppliers</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Time Period</label>
          <Select
            value={timeComparison}
            onValueChange={(value: any) => setTimeComparison(value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="previous">vs Previous Period</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Average Price Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Average Price Comparison</CardTitle>
          <CardDescription>
            Compare average prices across {comparisonType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No data available for comparison</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={(value: any) => [
                    `₹${value?.toFixed(2)}`,
                    "Average Price",
                  ]}
                />
                <Legend />
                <Bar dataKey="avgPrice" fill="#8884d8" name="Average Price" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Price Volatility Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Price Volatility Comparison</CardTitle>
          <CardDescription>
            Compare price volatility (max - min) across {comparisonType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No data available for comparison</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={(value: any) => [
                    `₹${value?.toFixed(2)}`,
                    "Price Volatility",
                  ]}
                />
                <Legend />
                <Bar
                  dataKey="volatility"
                  fill="#82ca9d"
                  name="Price Volatility"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Min/Max Price Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Price Range Comparison</CardTitle>
          <CardDescription>
            Compare minimum and maximum prices across {comparisonType}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No data available for comparison</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={(value: any, name: string) => [
                    `₹${value?.toFixed(2)}`,
                    name,
                  ]}
                />
                <Legend />
                <Bar dataKey="minPrice" fill="#ffc658" name="Minimum Price" />
                <Bar dataKey="maxPrice" fill="#ff7300" name="Maximum Price" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
