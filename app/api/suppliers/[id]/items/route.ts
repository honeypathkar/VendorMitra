import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/auth";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { id: supplierId } = params;

    if (!supplierId) {
      return NextResponse.json(
        { error: "Supplier ID is required" },
        { status: 400 }
      );
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(supplierId)) {
      return NextResponse.json(
        { error: "Invalid supplier ID format" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("BazaarBuddy");

    // Verify supplier exists
    const supplier = await db.collection("users").findOne({
      _id: new ObjectId(supplierId),
      role: "supplier",
    });

    if (!supplier) {
      return NextResponse.json(
        { error: "Supplier not found" },
        { status: 404 }
      );
    }

    // Fetch items for this supplier
    const items = await db
      .collection("items")
      .find({
        supplierId: new ObjectId(supplierId),
      })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        businessName: supplier.businessName,
        businessType: supplier.businessType,
      },
      items,
      totalItems: items.length,
    });
  } catch (error) {
    console.error("Get supplier items error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
