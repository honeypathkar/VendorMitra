"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface PriceStatisticsProps {
  data: any[];
  filters: any;
  products: any[];
}

export function PriceStatistics({
  data,
  filters,
  products,
}: PriceStatisticsProps) {
  // Calculate comprehensive statistics
  const calculateStatistics = () => {
    if (data.length === 0) return null;

    const prices = data.map((item) => item.price);
    const avgPrices = data.map((item) => item.avgPrice);

    // Basic statistics
    const totalDataPoints = data.length;
    const avgPrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Volatility calculation (standard deviation)
    const variance =
      prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) /
      prices.length;
    const volatility = Math.sqrt(variance);

    // Trend analysis
    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));
    const firstHalfAvg =
      firstHalf.reduce((sum, price) => sum + price, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, price) => sum + price, 0) / secondHalf.length;
    const trendDirection =
      secondHalfAvg > firstHalfAvg
        ? "up"
        : secondHalfAvg < firstHalfAvg
        ? "down"
        : "stable";
    const trendPercentage =
      ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    // Product-wise statistics
    const productStats = data.reduce((acc, item) => {
      if (!acc[item.productName]) {
        acc[item.productName] = {
          name: item.productName,
          prices: [],
          category: item.category,
        };
      }
      acc[item.productName].prices.push(item.price);
      return acc;
    }, {});

    const productAnalysis = Object.values(productStats).map((product: any) => {
      const productAvg =
        product.prices.reduce((sum: number, price: number) => sum + price, 0) /
        product.prices.length;
      const productMin = Math.min(...product.prices);
      const productMax = Math.max(...product.prices);
      const productVolatility = Math.sqrt(
        product.prices.reduce(
          (sum: number, price: number) => sum + Math.pow(price - productAvg, 2),
          0
        ) / product.prices.length
      );

      return {
        name: product.name,
        category: product.category,
        avgPrice: productAvg,
        minPrice: productMin,
        maxPrice: productMax,
        volatility: productVolatility,
        priceRange: productMax - productMin,
        dataPoints: product.prices.length,
      };
    });

    // Market insights
    const highVolatilityProducts = productAnalysis.filter(
      (p) => p.volatility > volatility * 1.5
    );
    const stableProducts = productAnalysis.filter(
      (p) => p.volatility < volatility * 0.5
    );
    const expensiveProducts = productAnalysis.filter(
      (p) => p.avgPrice > avgPrice * 1.2
    );
    const affordableProducts = productAnalysis.filter(
      (p) => p.avgPrice < avgPrice * 0.8
    );

    return {
      basic: {
        totalDataPoints,
        avgPrice,
        minPrice,
        maxPrice,
        priceRange,
        volatility,
      },
      trend: {
        direction: trendDirection,
        percentage: trendPercentage,
      },
      products: productAnalysis,
      insights: {
        highVolatilityProducts,
        stableProducts,
        expensiveProducts,
        affordableProducts,
      },
    };
  };

  const stats = calculateStatistics();

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p>No data available for statistical analysis</p>
        <p className="text-sm">
          Select products and date range to view statistics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Price</p>
                <p className="text-2xl font-bold">
                  ₹{stats.basic.avgPrice.toFixed(2)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Price Range</p>
                <p className="text-2xl font-bold">
                  ₹{stats.basic.priceRange.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  ₹{stats.basic.minPrice.toFixed(2)} - ₹
                  {stats.basic.maxPrice.toFixed(2)}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Volatility</p>
                <p className="text-2xl font-bold">
                  ₹{stats.basic.volatility.toFixed(2)}
                </p>
                <Badge
                  variant={
                    stats.basic.volatility > stats.basic.avgPrice * 0.2
                      ? "destructive"
                      : "default"
                  }
                >
                  {stats.basic.volatility > stats.basic.avgPrice * 0.2
                    ? "High"
                    : "Low"}
                </Badge>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trend</p>
                <p className="text-2xl font-bold">
                  {Math.abs(stats.trend.percentage).toFixed(1)}%
                </p>
                <Badge
                  variant={
                    stats.trend.direction === "up"
                      ? "destructive"
                      : stats.trend.direction === "down"
                      ? "default"
                      : "secondary"
                  }
                >
                  {stats.trend.direction === "up" && (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  )}
                  {stats.trend.direction === "down" && (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {stats.trend.direction.charAt(0).toUpperCase() +
                    stats.trend.direction.slice(1)}
                </Badge>
              </div>
              {stats.trend.direction === "up" ? (
                <TrendingUp className="h-8 w-8 text-red-500" />
              ) : stats.trend.direction === "down" ? (
                <TrendingDown className="h-8 w-8 text-green-500" />
              ) : (
                <BarChart3 className="h-8 w-8 text-gray-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product-wise Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Product-wise Analysis</CardTitle>
          <CardDescription>
            Detailed statistics for each product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Product</th>
                  <th className="text-left p-2">Category</th>
                  <th className="text-right p-2">Avg Price</th>
                  <th className="text-right p-2">Min Price</th>
                  <th className="text-right p-2">Max Price</th>
                  <th className="text-right p-2">Volatility</th>
                  <th className="text-right p-2">Data Points</th>
                </tr>
              </thead>
              <tbody>
                {stats.products.map((product: any, index: number) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{product.name}</td>
                    <td className="p-2 capitalize">{product.category}</td>
                    <td className="p-2 text-right">
                      ₹{product.avgPrice.toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      ₹{product.minPrice.toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      ₹{product.maxPrice.toFixed(2)}
                    </td>
                    <td className="p-2 text-right">
                      <Badge
                        variant={
                          product.volatility > stats.basic.volatility
                            ? "destructive"
                            : "default"
                        }
                      >
                        ₹{product.volatility.toFixed(2)}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">{product.dataPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Market Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>High Volatility Products</span>
            </CardTitle>
            <CardDescription>
              Products with high price fluctuations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.insights.highVolatilityProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No high volatility products found
              </p>
            ) : (
              <div className="space-y-2">
                {stats.insights.highVolatilityProducts.map(
                  (product: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-orange-50 rounded"
                    >
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="destructive">
                        ₹{product.volatility.toFixed(2)}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Stable Products</span>
            </CardTitle>
            <CardDescription>Products with consistent pricing</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.insights.stableProducts.length === 0 ? (
              <p className="text-gray-500 text-sm">No stable products found</p>
            ) : (
              <div className="space-y-2">
                {stats.insights.stableProducts.map(
                  (product: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-green-50 rounded"
                    >
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="default">
                        ₹{product.volatility.toFixed(2)}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
