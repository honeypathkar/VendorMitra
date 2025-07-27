"use client";

import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PriceTrendChartProps {
  data: any[];
  filters: any;
  products: any[];
}

export function PriceTrendChart({
  data,
  filters,
  products,
}: PriceTrendChartProps) {
  // Group data by product for multiple lines
  const groupedData = data.reduce((acc, item) => {
    const date = item.date;
    if (!acc[date]) {
      acc[date] = { date };
    }
    acc[date][item.productName] = item.price;
    acc[date][`${item.productName}_avg`] = item.avgPrice;
    acc[date][`${item.productName}_min`] = item.minPrice;
    acc[date][`${item.productName}_max`] = item.maxPrice;
    return acc;
  }, {});

  const chartData = Object.values(groupedData).sort(
    (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get unique products in the data
  const uniqueProducts = Array.from(
    new Set(data.map((item) => item.productName))
  );

  // Color palette for different products
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#00ff00",
    "#ff00ff",
    "#00ffff",
    "#ff0000",
    "#0000ff",
    "#ffff00",
  ];

  // Calculate trend for each product
  const calculateTrend = (productName: string) => {
    const productData = data.filter((item) => item.productName === productName);
    if (productData.length < 2) return "stable";

    const firstPrice = productData[0].price;
    const lastPrice = productData[productData.length - 1].price;
    const change = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (change > 5) return "up";
    if (change < -5) return "down";
    return "stable";
  };

  const formatTooltip = (value: any, name: string, props: any) => {
    if (name.includes("_avg")) {
      return [`₹${value?.toFixed(2)}`, `${name.replace("_avg", "")} (Avg)`];
    }
    if (name.includes("_min")) {
      return [`₹${value?.toFixed(2)}`, `${name.replace("_min", "")} (Min)`];
    }
    if (name.includes("_max")) {
      return [`₹${value?.toFixed(2)}`, `${name.replace("_max", "")} (Max)`];
    }
    return [`₹${value?.toFixed(2)}`, name];
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    if (filters.granularity === "daily") {
      return date.toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
      });
    } else if (filters.granularity === "weekly") {
      return `Week ${Math.ceil(date.getDate() / 7)}, ${date.toLocaleDateString(
        "en-IN",
        { month: "short" }
      )}`;
    } else {
      return date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Trend Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {uniqueProducts.slice(0, 3).map((productName, index) => {
          const trend = calculateTrend(productName);
          const productData = data.filter(
            (item) => item.productName === productName
          );
          const avgPrice =
            productData.reduce((sum, item) => sum + item.price, 0) /
            productData.length;

          return (
            <Card key={productName}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{productName}</p>
                    <p className="text-2xl font-bold">₹{avgPrice.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">Average Price</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        trend === "up"
                          ? "destructive"
                          : trend === "down"
                          ? "default"
                          : "secondary"
                      }
                      className="mb-2"
                    >
                      {trend === "up" && (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      )}
                      {trend === "down" && (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {trend === "stable" && <Minus className="h-3 w-3 mr-1" />}
                      {trend.charAt(0).toUpperCase() + trend.slice(1)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Price Trends Over Time</CardTitle>
          <CardDescription>
            {filters.priceType === "actual" && "Actual market prices"}
            {filters.priceType === "average" && "Average prices"}
            {filters.priceType === "range" && "Price ranges (min/max)"} •{" "}
            {filters.granularity} data
            {uniqueProducts.length > 0 &&
              ` • ${uniqueProducts.length} product${
                uniqueProducts.length > 1 ? "s" : ""
              }`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No price data available for the selected filters</p>
              <p className="text-sm">
                Try adjusting your date range or product selection
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxisLabel}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tickFormatter={(value) => `₹${value}`} />
                <Tooltip
                  formatter={formatTooltip}
                  labelFormatter={(label) =>
                    `Date: ${new Date(label).toLocaleDateString("en-IN")}`
                  }
                />
                <Legend />

                {/* Render lines based on price type */}
                {filters.priceType === "actual" &&
                  uniqueProducts.map((productName, index) => (
                    <Line
                      key={productName}
                      type="monotone"
                      dataKey={productName}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}

                {filters.priceType === "average" &&
                  uniqueProducts.map((productName, index) => (
                    <Line
                      key={`${productName}_avg`}
                      type="monotone"
                      dataKey={`${productName}_avg`}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  ))}

                {filters.priceType === "range" &&
                  uniqueProducts.map((productName, index) => (
                    <React.Fragment key={productName}>
                      <Line
                        type="monotone"
                        dataKey={`${productName}_min`}
                        stroke={colors[index % colors.length]}
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey={`${productName}_max`}
                        stroke={colors[index % colors.length]}
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey={productName}
                        stroke={colors[index % colors.length]}
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </React.Fragment>
                  ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
