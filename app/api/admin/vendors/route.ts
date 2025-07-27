import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
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
    const user = await db.collection("users").findOne({
      _id: new ObjectId(decoded.userId),
      role: "admin",
    })

    if (!user) {
      return NextResponse.json({ error: "Access denied. Admin role required." }, { status: 403 })
    }

    // Get all vendors
    const vendors = await db
      .collection("users")
      .find({ role: "vendor" }, { projection: { password: 0 } })
      .toArray()

    return NextResponse.json({ vendors })
  } catch (error) {
    console.error("Get vendors error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
