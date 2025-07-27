import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { items } = await request.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("BazaarBuddy");

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
    const validUnits = ["kg", "g", "l", "ml", "piece", "dozen", "pack"];

    const newItems = items.map((item) => {
      const category = item.category?.toLowerCase();
      const unit = item.unit?.toLowerCase();

      if (!validCategories.includes(category) || !validUnits.includes(unit)) {
        throw new Error(
          `Invalid category or unit in item: ${item.name || "Unnamed item"}`
        );
      }

      return {
        ...item,
        category,
        unit,
        stock: Number(item.stock),
        price: Number(item.price),
        supplierId: new ObjectId(decoded.userId),
        status: item.stock > 0 ? "in_stock" : "out_of_stock",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    });

    const result = await db.collection("items").insertMany(newItems);

    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount,
      insertedIds: result.insertedIds,
    });
  } catch (error) {
    console.error("Bulk create items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
