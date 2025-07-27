"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Calendar,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Target,
  DollarSign,
} from "lucide-react";

interface Insight {
  type: "warning" | "success" | "info";
  icon: any;
  title: string;
  description: string;
  action: string;
  priority: "high" | "medium" | "low";
}

interface Recommendation {
  product: string;
  action: "BUY" | "WAIT" | "CONSIDER";
  reason: string;
  confidence: "High" | "Medium" | "Low";
  currentPrice: number;
  avgPrice: number;
  savings?: string;
  premium?: string;
}

type PriorityLevel = "high" | "medium" | "low";

interface TrendInsightsProps {
  data: any[];
  filters: any;
  products: any[];
}

export function TrendInsights({ data, filters, products }: TrendInsightsProps) {
  // Generate actionable insights
  const generateInsights = (): Insight[] => {
    if (data.length === 0) return [];

    const insights: Insight[] = [];

    // Price trend insights
    const prices = data.map((item) => item.price);
    const avgPrice =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;

    // Recent vs historical comparison
    const recentData = data.slice(-Math.floor(data.length * 0.3)); // Last 30% of data
    const historicalData = data.slice(0, Math.floor(data.length * 0.7)); // First 70% of data

    if (recentData.length > 0 && historicalData.length > 0) {
      const recentAvg =
        recentData.reduce((sum, item) => sum + item.price, 0) /
        recentData.length;
      const historicalAvg =
        historicalData.reduce((sum, item) => sum + item.price, 0) /
        historicalData.length;
      const priceChange = ((recentAvg - historicalAvg) / historicalAvg) * 100;

      if (Math.abs(priceChange) > 10) {
        insights.push({
          type: priceChange > 0 ? "warning" : "success",
          icon: priceChange > 0 ? TrendingUp : TrendingDown,
          title: `Significant Price ${
            priceChange > 0 ? "Increase" : "Decrease"
          }`,
          description: `Prices have ${
            priceChange > 0 ? "increased" : "decreased"
          } by ${Math.abs(priceChange).toFixed(1)}% recently`,
          action:
            priceChange > 0
              ? "Consider bulk purchasing before further increases"
              : "Good time to increase inventory",
          priority: "high",
        });
      }
    }

    // Seasonal patterns
    const monthlyData = data.reduce((acc, item) => {
      const month = new Date(item.date).getMonth();
      if (!acc[month]) acc[month] = [];
      acc[month].push(item.price);
      return acc;
    }, {});

    const monthlyAvgs = Object.entries(monthlyData).map(
      ([month, prices]: [string, any]) => ({
        month: Number.parseInt(month),
        avg:
          prices.reduce((sum: number, price: number) => sum + price, 0) /
          prices.length,
      })
    );

    if (monthlyAvgs.length >= 3) {
      const sortedMonths = monthlyAvgs.sort((a, b) => a.avg - b.avg);
      const cheapestMonth = sortedMonths[0];
      const expensiveMonth = sortedMonths[sortedMonths.length - 1];

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      insights.push({
        type: "info",
        icon: Calendar,
        title: "Seasonal Price Pattern",
        description: `Lowest prices typically in ${
          monthNames[cheapestMonth.month]
        }, highest in ${monthNames[expensiveMonth.month]}`,
        action: `Plan purchases for ${
          monthNames[cheapestMonth.month]
        } to maximize savings`,
        priority: "medium",
      });
    }

    // Volatility insights
    const volatility = Math.sqrt(
      prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) /
        prices.length
    );
    const volatilityPercentage = (volatility / avgPrice) * 100;

    if (volatilityPercentage > 20) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        title: "High Price Volatility",
        description: `Price volatility is ${volatilityPercentage.toFixed(
          1
        )}%, indicating unstable market conditions`,
        action: "Consider smaller, more frequent orders to reduce risk",
        priority: "high",
      });
    } else if (volatilityPercentage < 5) {
      insights.push({
        type: "success",
        icon: CheckCircle,
        title: "Stable Market Conditions",
        description: `Low volatility (${volatilityPercentage.toFixed(
          1
        )}%) indicates stable pricing`,
        action: "Good time for bulk purchasing and long-term contracts",
        priority: "low",
      });
    }

    // Product-specific insights
    const productStats = data.reduce((acc, item) => {
      if (!acc[item.productName]) {
        acc[item.productName] = { prices: [], volumes: [] };
      }
      acc[item.productName].prices.push(item.price);
      acc[item.productName].volumes.push(item.volume || 0);
      return acc;
    }, {});

    Object.entries(productStats).forEach(
      ([productName, stats]: [string, any]) => {
        const productAvg =
          stats.prices.reduce((sum: number, price: number) => sum + price, 0) /
          stats.prices.length;
        const productVolatility = Math.sqrt(
          stats.prices.reduce(
            (sum: number, price: number) =>
              sum + Math.pow(price - productAvg, 2),
            0
          ) / stats.prices.length
        );

        // Check for products with unusual patterns
        if (productVolatility > volatility * 1.5) {
          insights.push({
            type: "warning",
            icon: Target,
            title: `${productName} - High Volatility`,
            description: `This product shows higher than average price fluctuations`,
            action: "Monitor closely and consider alternative suppliers",
            priority: "medium",
          });
        }

        // Check for trending products
        const recentProductPrices = stats.prices.slice(
          -Math.floor(stats.prices.length * 0.3)
        );
        const historicalProductPrices = stats.prices.slice(
          0,
          Math.floor(stats.prices.length * 0.7)
        );

        if (
          recentProductPrices.length > 0 &&
          historicalProductPrices.length > 0
        ) {
          const recentProductAvg =
            recentProductPrices.reduce(
              (sum: number, price: number) => sum + price,
              0
            ) / recentProductPrices.length;
          const historicalProductAvg =
            historicalProductPrices.reduce(
              (sum: number, price: number) => sum + price,
              0
            ) / historicalProductPrices.length;
          const productTrend =
            ((recentProductAvg - historicalProductAvg) / historicalProductAvg) *
            100;

          if (productTrend > 15) {
            insights.push({
              type: "warning",
              icon: TrendingUp,
              title: `${productName} - Rising Prices`,
              description: `Prices increased by ${productTrend.toFixed(
                1
              )}% recently`,
              action: "Consider stocking up or finding alternative suppliers",
              priority: "high",
            });
          } else if (productTrend < -15) {
            insights.push({
              type: "success",
              icon: TrendingDown,
              title: `${productName} - Falling Prices`,
              description: `Prices decreased by ${Math.abs(
                productTrend
              ).toFixed(1)}% recently`,
              action: "Good opportunity to increase inventory",
              priority: "medium",
            });
          }
        }
      }
    );

    // Market opportunity insights
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const dayOfMonth = currentDate.getDate();

    // Weekly patterns
    const weeklyData = data.reduce((acc, item) => {
      const day = new Date(item.date).getDay();
      if (!acc[day]) acc[day] = [];
      acc[day].push(item.price);
      return acc;
    }, {});

    const weeklyAvgs = Object.entries(weeklyData).map(
      ([day, prices]: [string, any]) => ({
        day: Number.parseInt(day),
        avg:
          prices.reduce((sum: number, price: number) => sum + price, 0) /
          prices.length,
      })
    );

    if (weeklyAvgs.length >= 5) {
      const sortedDays = weeklyAvgs.sort((a, b) => a.avg - b.avg);
      const cheapestDay = sortedDays[0];
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      insights.push({
        type: "info",
        icon: ShoppingCart,
        title: "Optimal Purchase Day",
        description: `${
          dayNames[cheapestDay.day]
        } typically has the lowest prices`,
        action: `Schedule regular orders for ${dayNames[cheapestDay.day]}s`,
        priority: "low",
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder: Record<PriorityLevel, number> = {
        high: 3,
        medium: 2,
        low: 1,
      };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const generateBuyingRecommendations = (): Recommendation[] => {
    if (data.length === 0) return [];

    const recommendations: Recommendation[] = [];
    const productStats = data.reduce((acc, item) => {
      if (!acc[item.productName]) {
        acc[item.productName] = {
          name: item.productName,
          prices: [],
          category: item.category,
          recentPrices: [],
        };
      }
      acc[item.productName].prices.push(item.price);

      // Consider last 20% as recent
      const isRecent = data.indexOf(item) >= Math.floor(data.length * 0.8);
      if (isRecent) {
        acc[item.productName].recentPrices.push(item.price);
      }

      return acc;
    }, {});

    Object.values(productStats).forEach((product: any) => {
      const avgPrice =
        product.prices.reduce((sum: number, price: number) => sum + price, 0) /
        product.prices.length;
      const recentAvg =
        product.recentPrices.length > 0
          ? product.recentPrices.reduce(
              (sum: number, price: number) => sum + price,
              0
            ) / product.recentPrices.length
          : avgPrice;

      const currentPrice =
        product.recentPrices[product.recentPrices.length - 1] || avgPrice;
      const minPrice = Math.min(...product.prices);
      const maxPrice = Math.max(...product.prices);

      // Recommendation logic
      if (currentPrice <= minPrice * 1.1) {
        recommendations.push({
          product: product.name,
          action: "BUY",
          reason: "Near historical low",
          confidence: "High",
          currentPrice,
          avgPrice,
          savings: (((avgPrice - currentPrice) / avgPrice) * 100).toFixed(1),
        });
      } else if (currentPrice >= maxPrice * 0.9) {
        recommendations.push({
          product: product.name,
          action: "WAIT",
          reason: "Near historical high",
          confidence: "High",
          currentPrice,
          avgPrice,
          premium: (((currentPrice - avgPrice) / avgPrice) * 100).toFixed(1),
        });
      } else if (recentAvg < avgPrice * 0.95) {
        recommendations.push({
          product: product.name,
          action: "CONSIDER",
          reason: "Below average price",
          confidence: "Medium",
          currentPrice,
          avgPrice,
          savings: (((avgPrice - currentPrice) / avgPrice) * 100).toFixed(1),
        });
      }
    });

    return recommendations;
  };

  const insights: Insight[] = generateInsights();
  const recommendations: Recommendation[] = generateBuyingRecommendations();

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <span>Market Insights</span>
          </CardTitle>
          <CardDescription>
            AI-powered analysis of price trends and market conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <p className="text-gray-500">
              No significant insights available for the selected data range.
            </p>
          ) : (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <Alert
                  key={index}
                  className={`border-l-4 ${
                    insight.type === "warning"
                      ? "border-l-orange-500 bg-orange-50"
                      : insight.type === "success"
                      ? "border-l-green-500 bg-green-50"
                      : "border-l-blue-500 bg-blue-50"
                  }`}
                >
                  <insight.icon className="h-4 w-4" />
                  <div className="ml-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{insight.title}</h4>
                      <Badge
                        variant={
                          insight.priority === "high"
                            ? "destructive"
                            : insight.priority === "medium"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {insight.priority}
                      </Badge>
                    </div>
                    <AlertDescription>
                      <p className="mb-2">{insight.description}</p>
                      <p className="text-sm font-medium text-gray-700">
                        💡 Action: {insight.action}
                      </p>
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Buying Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-500" />
            <span>Buying Recommendations</span>
          </CardTitle>
          <CardDescription>
            Data-driven purchase recommendations based on price analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <p className="text-gray-500">
              No specific recommendations available. Continue monitoring price
              trends.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec, index) => (
                <Card
                  key={index}
                  className={`border-l-4 ${
                    rec.action === "BUY"
                      ? "border-l-green-500"
                      : rec.action === "WAIT"
                      ? "border-l-red-500"
                      : "border-l-yellow-500"
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{rec.product}</h4>
                      <Badge
                        variant={
                          rec.action === "BUY"
                            ? "default"
                            : rec.action === "WAIT"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {rec.action}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span>Current:</span>
                        <span className="font-medium">
                          ₹{rec.currentPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Average:</span>
                        <span>₹{rec.avgPrice.toFixed(2)}</span>
                      </div>
                      {rec.savings && (
                        <div className="flex justify-between text-green-600">
                          <span>Savings:</span>
                          <span className="font-medium">{rec.savings}%</span>
                        </div>
                      )}
                      {rec.premium && (
                        <div className="flex justify-between text-red-600">
                          <span>Premium:</span>
                          <span className="font-medium">{rec.premium}%</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {rec.confidence} Confidence
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Market Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Market Summary</CardTitle>
          <CardDescription>
            Overall market conditions and outlook
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800">Market Trend</h4>
              <p className="text-2xl font-bold text-blue-600">
                {insights.filter(
                  (i) => i.type === "warning" && i.title.includes("Increase")
                ).length >
                insights.filter(
                  (i) => i.type === "success" && i.title.includes("Decrease")
                ).length
                  ? "Rising"
                  : "Stable"}
              </p>
              <p className="text-sm text-blue-600">Overall direction</p>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800">
                Buy Opportunities
              </h4>
              <p className="text-2xl font-bold text-green-600">
                {recommendations.filter((r) => r.action === "BUY").length}
              </p>
              <p className="text-sm text-green-600">Products to buy now</p>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800">
                High Priority Alerts
              </h4>
              <p className="text-2xl font-bold text-orange-600">
                {insights.filter((i) => i.priority === "high").length}
              </p>
              <p className="text-sm text-orange-600">Require attention</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
