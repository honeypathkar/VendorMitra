import { type NextRequest, NextResponse } from "next/server"
import { verifyOTP } from "@/lib/otp"

export async function POST(request: NextRequest) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 })
    }

    const isValid = verifyOTP(email, otp)

    if (!isValid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "OTP verified successfully",
    })
  } catch (error) {
    console.error("Verify OTP error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
