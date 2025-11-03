import mongoose from 'mongoose'

// Prefer MONGODB_URI, but fall back to MONGO_URI for legacy/env compatibility
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI

// Only throw error when actually connecting, not when importing
// This allows the file to be imported in client-side code without errors
if (typeof window === 'undefined' && !MONGODB_URI) {
  console.warn('Warning: MONGODB_URI not found in environment variables')
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Reuse connection across hot-reloads in dev to avoid creating multiple connections
const globalForMongoose = globalThis as unknown as { __mongoose__: MongooseCache | undefined }

const cached: MongooseCache = globalForMongoose.__mongoose__ || { conn: null, promise: null }
if (!globalForMongoose.__mongoose__) {
  globalForMongoose.__mongoose__ = cached
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI (or MONGO_URI) in environment variables')
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // Mongoose 8+ uses sensible defaults; options left empty intentionally
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

export default connectDB