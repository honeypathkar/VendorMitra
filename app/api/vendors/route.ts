import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("BazaarBuddy")
    const vendors = await db.collection("vendors").find({}).toArray()

    return NextResponse.json({ vendors })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vendors" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await clientPromise
    const db = client.db("BazaarBuddy")
    const body = await request.json()

    const vendor = {
      ...body,
      createdAt: new Date(),
      status: "active",
    }

    const result = await db.collection("vendors").insertOne(vendor)

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create vendor" }, { status: 500 })
  }
}
