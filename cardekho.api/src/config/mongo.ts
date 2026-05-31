import mongoose from 'mongoose'

export async function connectDB(uri?: string) {
  const mongoUri = uri || process.env.CONN || process.env.DATABASE_URL
  if (!mongoUri) {
    console.warn('No MongoDB URI provided in environment; skipping connect')
    return
  }
  try {
    await mongoose.connect(mongoUri)
    console.log('Connected to MongoDB')
  } catch (err) {
    console.error('MongoDB connection error:', err)
    throw err
  }
}
