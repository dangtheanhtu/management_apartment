import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  _id: string
  email: string
  password: string
  fullName: string
  phone?: string
  role: 'admin' | 'staff' | 'resident'
  status: 'active' | 'inactive' | 'suspended'
  avatarUrl?: string
  apartmentId?: string
  moveInDate?: Date
  leaseStartDate?: Date
  leaseEndDate?: Date
  monthlyRent?: number
  depositAmount?: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'resident'],
    default: 'resident'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  avatarUrl: {
    type: String
  },
  apartmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Apartment'
  },
  moveInDate: {
    type: Date
  },
  leaseStartDate: {
    type: Date
  },
  leaseEndDate: {
    type: Date
  },
  monthlyRent: {
    type: Number
  },
  depositAmount: {
    type: Number
  }
}, {
  timestamps: true
})

// Email already has unique index from schema definition
// Other indexes
UserSchema.index({ role: 1 })
UserSchema.index({ status: 1 })
UserSchema.index({ apartmentId: 1 })

export const User = (mongoose.models?.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', UserSchema)