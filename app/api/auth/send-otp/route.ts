import { type NextRequest, NextResponse } from "next/server"
import { generateOTP, storeOTP } from "@/lib/otp"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const otp = generateOTP()
    storeOTP(email, otp)

    // Try to send email if configured, but don't fail if it doesn't work
    try {
      const { sendOTPEmail } = await import("@/lib/email")
      await sendOTPEmail(email, otp)
    } catch (emailError) {
      console.error("Email sending failed:", emailError)
      // Continue without failing the request
    }

    return NextResponse.json({
      success: true,
      message: "OTP generated successfully",
      // In development, return OTP for testing
      ...(process.env.NODE_ENV === "development" && { otp }),
    })
  } catch (error) {
    console.error("Send OTP error:", error)
    return NextResponse.json({ error: "Failed to generate OTP" }, { status: 500 })
  }
}
