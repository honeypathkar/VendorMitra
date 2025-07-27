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

    const client = await clientPromise
    const db = client.db("BazaarBuddy")

    // Check if user is admin
    const admin = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
      role: "admin",
    })

    if (!admin) {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 })
    }

    // Decline vendor
    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          status: "declined",
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Vendor not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Vendor declined successfully" })
  } catch (error) {
    console.error("Decline vendor error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
