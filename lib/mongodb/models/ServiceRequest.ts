import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IServiceRequest extends Document {
  _id: string
  userId: Types.ObjectId
  apartmentId: Types.ObjectId
  title: string
  description: string
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other'
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'resolved'
  assignedTo?: Types.ObjectId
  images: string[]
  createdAt: Date
  updatedAt: Date
}

const ServiceRequestSchema = new Schema<IServiceRequest>({
  userId: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
    required: true
  },
  apartmentId: {
    type: Schema.Types.ObjectId as any,
    ref: 'Apartment',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  category: {
    type: String,
    enum: ['plumbing', 'electrical', 'hvac', 'appliance', 'structural', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'cancelled'],
    default: 'pending'
  },
  assignedTo: {
    type: Schema.Types.ObjectId as any,
    ref: 'User'
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
})

// Indexes
ServiceRequestSchema.index({ userId: 1 })
ServiceRequestSchema.index({ apartmentId: 1 })
ServiceRequestSchema.index({ status: 1 })
ServiceRequestSchema.index({ category: 1 })
ServiceRequestSchema.index({ createdAt: -1 })

// Clear existing model to allow re-registration with updated schema
if (mongoose.models?.ServiceRequest) {
  delete mongoose.models.ServiceRequest;
}

export const ServiceRequest = mongoose.model<IServiceRequest>('ServiceRequest', ServiceRequestSchema)
