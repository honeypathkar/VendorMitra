import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid category ID" }, { status: 400 })
    }

    // Delete the category
    const result = await db.collection("categories").deleteOne({
      _id: new ObjectId(id),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
