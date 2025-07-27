import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { hashPassword, generateToken } from "@/lib/auth";
import { verifyOTP } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Signup request body:", body);

    const {
      email,
      password,
      role,
      name,
      phone,
      businessName,
      address,
      city,
      state,
      pincode,
      businessType,
      gstNumber,
      operatingHours,
      deliveryRadius,
      otp,
    } = body;

    // Validate required fields
    if (!email || !password || !role || !name || !otp) {
      console.log("Missing required fields:", {
        email: !!email,
        password: !!password,
        role: !!role,
        name: !!name,
        otp: !!otp,
      });
      return NextResponse.json(
        { error: "Email, password, role, name, and OTP are required" },
        { status: 400 }
      );
    }

    console.log("Verifying OTP for email:", email, "OTP:", otp);

    // ✅ Verify OTP first
    const isValid = await verifyOTP(email, otp);
    console.log("OTP verification result:", isValid);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // ✅ Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // ✅ Password length check
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // ✅ Role validation
    if (!["vendor", "supplier"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be vendor or supplier" },
        { status: 400 }
      );
    }

    console.log("Connecting to database...");
    const client = await clientPromise;
    const db = client.db("BazaarBuddy");

    // ✅ Check existing user
    const existingUser = await db
      .collection("users")
      .findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    // ✅ Hash password
    const hashedPassword = await hashPassword(password);

    // ✅ Create user object
    const newUser = {
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      name: name.trim(),
      phone: phone ? phone.trim() : null,
      businessName: businessName ? businessName.trim() : null,
      status: role === "supplier" ? "pending" : "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        address: address ? address.trim() : null,
        city: city ? city.trim() : null,
        state: state ? state.trim() : null,
        pincode: pincode ? pincode.trim() : null,
        businessType: businessType ? businessType.trim() : null,
        gstNumber: gstNumber ? gstNumber.trim() : null,
        operatingHours: operatingHours ? operatingHours.trim() : null,
        deliveryRadius: deliveryRadius ? Number.parseInt(deliveryRadius) : null,
      },
    };

    console.log("Creating user:", { ...newUser, password: "[HIDDEN]" });

    const result = await db.collection("users").insertOne(newUser);

    if (!result.insertedId) {
      throw new Error("Failed to create user");
    }

    console.log("User created successfully with ID:", result.insertedId);

    const token = generateToken(result.insertedId.toString());
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      success: true,
      token,
      user: { ...userWithoutPassword, _id: result.insertedId },
    });
  } catch (error: any) {
    console.error("Signup error:", error);

    if (error.name === "MongoServerError" && error.code === 11000) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: "Signup failed. Please try again.",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
