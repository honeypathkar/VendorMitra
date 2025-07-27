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

    // Get all categories
    const categories = await db.collection("categories").find({}).toArray()

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { name, description } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 })
    }

    // Check if category already exists
    const existingCategory = await db.collection("categories").findOne({
      name: name.toLowerCase().trim(),
    })

    if (existingCategory) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 })
    }

    // Create new category
    const category = {
      name: name.toLowerCase().trim(),
      displayName: name.trim(),
      description: description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: decoded.userId,
    }

    const result = await db.collection("categories").insertOne(category)

    return NextResponse.json({
      success: true,
      category: {
        _id: result.insertedId,
        ...category,
      },
    })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
