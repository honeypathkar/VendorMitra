import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const validStatuses = ["pending", "accepted", "preparing", "out_for_delivery", "delivered", "cancelled"]

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("BazaarBuddy")

    const result = await db.collection("orders").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Order status updated successfully" })
  } catch (error) {
    console.error("Update order status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
