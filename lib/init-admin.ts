import clientPromise from "./mongodb"
import { hashPassword } from "./auth"

export const initializeAdmin = async () => {
  try {
    console.log("Initializing admin user...")

    const client = await clientPromise
    const db = client.db("BazaarBuddy")

    // Check if admin already exists
    const existingAdmin = await db.collection("users").findOne({
      email: "patwaji.devx@gmail.com",
      role: "admin",
    })

    if (existingAdmin) {
      console.log("Admin user already exists")
      return
    }

    console.log("Creating admin user...")

    const hashedPassword = await hashPassword("VendorMitra@2025")

    const adminUser = {
      email: "patwaji.devx@gmail.com",
      password: hashedPassword,
      role: "admin",
      name: "Admin User",
      phone: "+91 9999999999",
      businessName: "BazaarBuddy Admin",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
      profile: {
        address: "Admin Office",
        city: "Delhi",
        state: "delhi",
        pincode: "110001",
      },
    }

    const result = await db.collection("users").insertOne(adminUser)
    console.log("Admin user created successfully with ID:", result.insertedId)

    return result.insertedId
  } catch (error) {
    console.error("Error initializing admin:", error)
    throw error // Re-throw to see the actual error
  }
}
