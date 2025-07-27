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
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Order request body:", body); // Debug log

    const { supplierId, items, deliveryAddress, paymentMethod = "cash" } = body;

    // Validation
    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        {
          error: "Supplier ID and items are required",
          received: { supplierId, items: items?.length || 0 },
        },
        { status: 400 }
      );
    }

    if (!deliveryAddress || deliveryAddress.trim() === "") {
      return NextResponse.json(
        { error: "Delivery address is required" },
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

    // Calculate total amount and validate items
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      console.log("Processing item:", item); // Debug log

      if (!item.itemId || !ObjectId.isValid(item.itemId)) {
        return NextResponse.json(
          {
            error: `Invalid item ID: ${item.itemId}`,
          },
          { status: 400 }
        );
      }

      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          {
            error: `Invalid quantity for item: ${item.itemId}`,
          },
          { status: 400 }
        );
      }

      const dbItem = await db.collection("items").findOne({
        _id: new ObjectId(item.itemId),
        supplierId: new ObjectId(supplierId), // Ensure item belongs to the supplier
      });

      if (!dbItem) {
        return NextResponse.json(
          {
            error: `Item not found or doesn't belong to supplier: ${item.itemId}`,
          },
          { status: 404 }
        );
      }

      if (dbItem.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${dbItem.name}. Available: ${dbItem.stock}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }

      const itemTotal = dbItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        itemId: new ObjectId(item.itemId),
        name: dbItem.name,
        price: dbItem.price,
        quantity: item.quantity,
        unit: dbItem.unit,
        total: itemTotal,
      });
    }

    // Create order
    const newOrder = {
      orderId: `ORD${Date.now()}`,
      vendorId: new ObjectId(decoded.userId),
      supplierId: new ObjectId(supplierId),
      items: orderItems,
      totalAmount,
      paymentMethod,
      deliveryAddress: deliveryAddress.trim(),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log("Creating order:", newOrder); // Debug log

    const result = await db.collection("orders").insertOne(newOrder);

    // Update item stocks
    for (const item of items) {
      await db.collection("items").updateOne(
        { _id: new ObjectId(item.itemId) },
        {
          $inc: { stock: -item.quantity },
          $set: {
            updatedAt: new Date(),
            status: function () {
              // This will be handled by a separate update after we get the new stock
              return this.stock <= 0 ? "out_of_stock" : "in_stock";
            },
          },
        }
      );
    }

    // Update item status based on new stock levels
    for (const item of items) {
      const updatedItem = await db.collection("items").findOne({
        _id: new ObjectId(item.itemId),
      });

      if (updatedItem) {
        await db.collection("items").updateOne(
          { _id: new ObjectId(item.itemId) },
          {
            $set: {
              status: updatedItem.stock <= 0 ? "out_of_stock" : "in_stock",
              updatedAt: new Date(),
            },
          }
        );
      }
    }

    return NextResponse.json({
      success: true,
      order: { ...newOrder, _id: result.insertedId },
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

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

    // Get user to determine role
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let query = {};
    if (user.role === "vendor") {
      query = { vendorId: new ObjectId(decoded.userId) };
    } else if (user.role === "supplier") {
      query = { supplierId: new ObjectId(decoded.userId) };
    }

    const orders = await db
      .collection("orders")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      orders,
      totalOrders: orders.length,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
