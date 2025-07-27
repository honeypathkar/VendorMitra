import { MongoClient } from "mongodb"

if (!process.env.MONGO_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGO_URI"')
}

const uri = process.env.MONGO_URI
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // Increased timeout
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
      console.error("MongoDB connection error:", error)
      throw error
    })
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect().catch((error) => {
    console.error("MongoDB connection error:", error)
    throw error
  })
}

// Test the connection
clientPromise
  .then(() => {
    console.log("MongoDB connected successfully")
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error)
  })

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise
