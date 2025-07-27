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

    // Get all suppliers
    const suppliers = await db
      .collection("users")
      .find(
        { role: "supplier" },
        { projection: { name: 1, businessName: 1, businessType: 1 } }
      )
      .toArray();

    return NextResponse.json({
      success: true,
      suppliers,
    });
  } catch (error) {
    console.error("Suppliers API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
