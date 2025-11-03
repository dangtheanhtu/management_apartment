import mongoose, { Schema, Document } from 'mongoose'

export interface IApartment extends Document {
  _id: string
  apartmentNumber: string
  floor: number
  building: string
  area: number
  bedrooms: number
  bathrooms: number
  rentPrice: number
  status: 'available' | 'occupied' | 'maintenance'
  description?: string
  imageUrl?: string
  amenities: string[]
  images: string[]
  createdAt: Date
  updatedAt: Date
}

const ApartmentSchema = new Schema<IApartment>({
  apartmentNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  floor: {
    type: Number,
    required: true,
    min: 1
  },
  building: {
    type: String,
    required: true,
    trim: true
  },
  area: {
    type: Number,
    required: true,
    min: 0
  },
  bedrooms: {
    type: Number,
    required: true,
    min: 0
  },
  bathrooms: {
    type: Number,
    required: true,
    min: 0
  },
  rentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  description: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  amenities: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String
  }]
}, {
  timestamps: true
})

// apartmentNumber already has unique index from schema definition
// Other indexes
ApartmentSchema.index({ building: 1 })
ApartmentSchema.index({ floor: 1 })
ApartmentSchema.index({ status: 1 })

export const Apartment = (mongoose.models?.Apartment as mongoose.Model<IApartment>) || mongoose.model<IApartment>('Apartment', ApartmentSchema)