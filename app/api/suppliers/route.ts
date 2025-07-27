import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("BazaarBuddy")

    // Fetch all users with role "supplier"
    const suppliers = await db.collection("users").find({ role: "supplier" }).toArray()

    return NextResponse.json({ suppliers })
  } catch (error) {
    console.error("Error fetching suppliers:", error)
    return NextResponse.json({ error: "Failed to fetch suppliers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("BazaarBuddy")
    const body = await request.json()

    const supplier = {
      ...body,
      role: "supplier",
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
      rating: 0,
      totalOrders: 0,
    }

    const result = await db.collection("users").insertOne(supplier)

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    console.error("Error creating supplier:", error)
    return NextResponse.json({ error: "Failed to create supplier" }, { status: 500 })
  }
}
