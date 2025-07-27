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
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Get all products for analytics
    const products = await db
      .collection("items")
      .find({}, { projection: { name: 1, category: 1, supplierId: 1 } })
      .toArray();

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
