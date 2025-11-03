import mongoose, { Schema, Document } from 'mongoose'

export interface IImage extends Document {
  _id: string
  url: string
  altText?: string
  apartmentId?: string
  amenityId?: string
  userId?: string
  createdAt: Date
}

const ImageSchema = new Schema<IImage>({
  url: {
    type: String,
    required: true,
    trim: true
  },
  altText: {
    type: String,
    trim: true
  },
  apartmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Apartment'
  },
  amenityId: {
    type: Schema.Types.ObjectId,
    ref: 'Amenity'
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
})

// Indexes
ImageSchema.index({ apartmentId: 1 })
ImageSchema.index({ amenityId: 1 })
ImageSchema.index({ userId: 1 })

export const Image = (mongoose.models?.Image as mongoose.Model<IImage>) || mongoose.model<IImage>('Image', ImageSchema)
