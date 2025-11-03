import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IMessage extends Document {
  _id: string
  serviceRequestId: Types.ObjectId
  sender: Types.ObjectId
  content: string
  createdAt: Date
  updatedAt: Date
}

const MessageSchema = new Schema<IMessage>({
  serviceRequestId: {
    type: Schema.Types.ObjectId as any,
    ref: 'ServiceRequest',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId as any,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  }
}, {
  timestamps: true
})

// Indexes
MessageSchema.index({ serviceRequestId: 1, createdAt: 1 })
MessageSchema.index({ sender: 1 })

export const Message = (mongoose.models?.Message as mongoose.Model<IMessage>) || mongoose.model<IMessage>('Message', MessageSchema)
