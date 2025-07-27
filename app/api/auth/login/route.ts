import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { comparePassword, generateToken } from "@/lib/auth"
import { initializeAdmin } from "@/lib/init-admin"

export async function POST(request: NextRequest) {
  try {
    // Initialize admin on first run (but don't block login if it fails)
    try {
      await initializeAdmin()
    } catch (adminError) {
      console.error("Admin initialization failed:", adminError)
      // Continue with login even if admin init fails
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("BazaarBuddy")

    // Find user by email
    const user = await db.collection("users").findOne({ email })

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check if user is active (except for admin)
    if (user.role !== "admin" && user.status !== "active") {
      return NextResponse.json({ error: "Account is not active. Please contact admin." }, { status: 403 })
    }

    // Generate token
    const token = generateToken(user._id.toString())

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      token,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
