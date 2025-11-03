import mongoose, { Schema, Document } from 'mongoose'

export interface ITransaction extends Document {
  _id: string
  invoiceId: string
  userId: string
  paymentGateway: 'vnpay' | 'momo' | 'bank_transfer' | 'cash'
  transactionCode?: string
  amountPaid: number
  paymentDate: Date
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  notes?: string
  createdAt: Date
}

const TransactionSchema = new Schema<ITransaction>({
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentGateway: {
    type: String,
    enum: ['vnpay', 'momo', 'bank_transfer', 'cash'],
    required: true
  },
  transactionCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
})

// transactionCode already has unique index from schema definition
// Other indexes
TransactionSchema.index({ invoiceId: 1 })
TransactionSchema.index({ userId: 1 })
TransactionSchema.index({ status: 1 })
TransactionSchema.index({ paymentDate: 1 })

export const Transaction = (mongoose.models?.Transaction as mongoose.Model<ITransaction>) || mongoose.model<ITransaction>('Transaction', TransactionSchema)
