import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

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

    const body = await request.json()
    const { name, category, stock, unit, price, description, image } = body

    if (!name || !category || stock === undefined || !unit || price === undefined) {
      return NextResponse.json({ error: "Name, category, stock, unit, and price are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("BazaarBuddy")

    const newItem = {
      name,
      category,
      stock: Number(stock),
      unit,
      price: Number(price),
      description,
      image,
      supplierId: new ObjectId(decoded.userId),
      status: stock > 0 ? "in_stock" : "out_of_stock",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("items").insertOne(newItem)

    return NextResponse.json({
      success: true,
      item: { ...newItem, _id: result.insertedId },
    })
  } catch (error) {
    console.error("Create item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    // Get items for the current supplier
    const items = await db
      .collection("items")
      .find({
        supplierId: new ObjectId(decoded.userId),
      })
      .toArray()

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Get items error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
