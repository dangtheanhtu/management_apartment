import mongoose, { Schema, Document } from 'mongoose'

export interface IAmenity extends Document {
  _id: string
  name: string
  description: string
  type: 'facility' | 'service' | 'equipment'
  status: 'active' | 'inactive' | 'maintenance'
  capacity?: number
  operatingHours?: string
  location?: string
  imageUrl?: string
  images: string[]
  pricing?: {
    type: 'free' | 'paid' | 'subscription'
    amount?: number
    currency?: string
  }
  bookingRequired: boolean
  createdAt: Date
  updatedAt: Date
}

const AmenitySchema = new Schema<IAmenity>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['facility', 'service', 'equipment'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  capacity: {
    type: Number,
    min: 1
  },
  operatingHours: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  images: [{
    type: String
  }],
  pricing: {
    type: {
      type: String,
      enum: ['free', 'paid', 'subscription'],
      default: 'free'
    },
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'VND'
    }
  },
  bookingRequired: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
})

// Indexes
AmenitySchema.index({ name: 1 })
AmenitySchema.index({ type: 1 })
AmenitySchema.index({ status: 1 })

export const Amenity = (mongoose.models?.Amenity as mongoose.Model<IAmenity>) || mongoose.model<IAmenity>('Amenity', AmenitySchema)
