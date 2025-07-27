import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db("BazaarBuddy");

    // Get user to verify role
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user || !["vendor", "admin"].includes(user.role)) {
      return NextResponse.json(
        { error: "Access denied. Vendors and admins only." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const granularity = searchParams.get("granularity") || "daily";
    const priceType = searchParams.get("priceType") || "actual";
    const products =
      searchParams.get("products")?.split(",").filter(Boolean) || [];
    const categories =
      searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const suppliers =
      searchParams.get("suppliers")?.split(",").filter(Boolean) || [];

    // Build aggregation pipeline
    const pipeline: any[] = [];

    // Match stage for date range and filters
    const matchStage: any = {};

    if (startDate && endDate) {
      matchStage.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (products.length > 0) {
      matchStage._id = { $in: products.map((id) => new ObjectId(id)) };
    }

    if (categories.length > 0) {
      matchStage.category = { $in: categories };
    }

    if (suppliers.length > 0) {
      matchStage.supplierId = { $in: suppliers.map((id) => new ObjectId(id)) };
    }

    // Get items first
    const items = await db.collection("items").find(matchStage).toArray();

    if (items.length === 0) {
      return NextResponse.json({ priceData: [] });
    }

    const itemIds = items.map((item) => item._id);

    // Get orders containing these items
    const orders = await db
      .collection("orders")
      .find({
        "items.itemId": { $in: itemIds },
        ...(startDate &&
          endDate && {
            createdAt: {
              $gte: new Date(startDate),
              $lte: new Date(endDate),
            },
          }),
      })
      .toArray();

    // Process price data
    const priceData: any[] = [];

    orders.forEach((order) => {
      order.items.forEach((orderItem: any) => {
        const item = items.find(
          (i) => i._id.toString() === orderItem.itemId.toString()
        );
        if (item) {
          // Group by granularity
          const date = new Date(order.createdAt);
          let groupDate: string;

          if (granularity === "weekly") {
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            groupDate = weekStart.toISOString().split("T")[0];
          } else if (granularity === "monthly") {
            groupDate = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}-01`;
          } else {
            groupDate = date.toISOString().split("T")[0];
          }

          priceData.push({
            date: groupDate,
            price: orderItem.price,
            avgPrice: orderItem.price, // Will be calculated later
            minPrice: orderItem.price,
            maxPrice: orderItem.price,
            volume: orderItem.quantity,
            productId: item._id.toString(),
            productName: item.name,
            category: item.category,
            supplierId: item.supplierId?.toString(),
            supplierName: "Supplier", // Could be populated from supplier data
          });
        }
      });
    });

    // Group and calculate averages
    const groupedData = priceData.reduce((acc, item) => {
      const key = `${item.date}-${item.productId}`;
      if (!acc[key]) {
        acc[key] = {
          date: item.date,
          productId: item.productId,
          productName: item.productName,
          category: item.category,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
          prices: [],
          volumes: [],
        };
      }
      acc[key].prices.push(item.price);
      acc[key].volumes.push(item.volume);
      return acc;
    }, {});

    const processedData = Object.values(groupedData).map((group: any) => ({
      date: group.date,
      price:
        group.prices.reduce((sum: number, price: number) => sum + price, 0) /
        group.prices.length,
      avgPrice:
        group.prices.reduce((sum: number, price: number) => sum + price, 0) /
        group.prices.length,
      minPrice: Math.min(...group.prices),
      maxPrice: Math.max(...group.prices),
      volume: group.volumes.reduce((sum: number, vol: number) => sum + vol, 0),
      productId: group.productId,
      productName: group.productName,
      category: group.category,
      supplierId: group.supplierId,
      supplierName: group.supplierName,
    }));

    return NextResponse.json({
      success: true,
      priceData: processedData.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
    });
  } catch (error) {
    console.error("Price trends API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
