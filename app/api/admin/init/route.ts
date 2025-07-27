import { type NextRequest, NextResponse } from "next/server"
import { initializeAdmin } from "@/lib/init-admin"

export async function POST(request: NextRequest) {
  try {
    const result = await initializeAdmin()

    return NextResponse.json({
      success: true,
      message: "Admin user initialized successfully",
      adminId: result,
    })
  } catch (error) {
    console.error("Admin initialization error:", error)
    return NextResponse.json(
      {
        error: "Failed to initialize admin",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
