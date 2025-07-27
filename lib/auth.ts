import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.SECRET || "fallback-secret-key-for-development"

export interface User {
  _id: string
  email: string
  role: "vendor" | "supplier" | "admin"
  name: string
  phone?: string
  businessName?: string
  status: "active" | "pending" | "declined"
}

export const hashPassword = async (password: string): Promise<string> => {
  try {
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters long")
    }

    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    if (!hashedPassword) {
      throw new Error("Failed to hash password")
    }

    return hashedPassword
  } catch (error) {
    console.error("Password hashing error:", error)
    throw new Error("Failed to hash password: " + error.message)
  }
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  try {
    if (!password || !hashedPassword) {
      return false
    }

    return await bcrypt.compare(password, hashedPassword)
  } catch (error) {
    console.error("Password comparison error:", error)
    return false
  }
}

export const generateToken = (userId: string): string => {
  try {
    if (!userId) {
      throw new Error("User ID is required for token generation")
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" })

    if (!token) {
      throw new Error("Failed to generate token")
    }

    return token
  } catch (error) {
    console.error("Token generation error:", error)
    throw new Error("Failed to generate token: " + error.message)
  }
}

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }

    if (!decoded || !decoded.userId) {
      return null
    }

    return decoded
  } catch (error) {
    console.error("Token verification error:", error)
    return null
  }
}

export const getUserFromRequest = async (request: NextRequest): Promise<User | null> => {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) return null

    const decoded = verifyToken(token)
    if (!decoded) return null

    // In a real app, you'd fetch the user from the database
    // For now, we'll return a mock user
    return {
      _id: decoded.userId,
      email: "user@example.com",
      role: "vendor",
      name: "Test User",
      status: "active",
    }
  } catch (error) {
    console.error("Get user from request error:", error)
    return null
  }
}
