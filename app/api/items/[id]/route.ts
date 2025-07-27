import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const item = await db.collection("items").findOne({
      _id: new ObjectId(params.id),
      supplierId: new ObjectId(decoded.userId),
    })

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error("Get item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const body = await request.json()
    const { name, category, stock, unit, price, description, image } = body

    const client = await clientPromise
    const db = client.db("BazaarBuddy")

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (name) updateData.name = name
    if (category) updateData.category = category
    if (stock !== undefined) {
      updateData.stock = Number(stock)
      updateData.status = Number(stock) > 0 ? "in_stock" : "out_of_stock"
    }
    if (unit) updateData.unit = unit
    if (price !== undefined) updateData.price = Number(price)
    if (description) updateData.description = description
    if (image) updateData.image = image

    const result = await db.collection("items").updateOne(
      {
        _id: new ObjectId(params.id),
        supplierId: new ObjectId(decoded.userId),
      },
      { $set: updateData },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Item updated successfully" })
  } catch (error) {
    console.error("Update item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const result = await db.collection("items").deleteOne({
      _id: new ObjectId(params.id),
      supplierId: new ObjectId(decoded.userId),
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Item deleted successfully" })
  } catch (error) {
    console.error("Delete item error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
