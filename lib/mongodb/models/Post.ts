import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IPost extends Document {
  _id: string
  userId: Types.ObjectId | string
  content: string
  imageUrl?: string
  postType: 'general' | 'announcement' | 'event' | 'complaint' | 'suggestion'
  isAnonymous: boolean
  likes: (Types.ObjectId | string)[]
  comments: IComment[]
  createdAt: Date
  updatedAt: Date
}

export interface IComment extends Document {
  _id: string
  userId: Types.ObjectId | string
  content: string
  parentCommentId?: Types.ObjectId | string | null
  likes: (Types.ObjectId | string)[]
  createdAt: Date
}

const CommentSchema = new Schema<IComment>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  parentCommentId: {
    type: Schema.Types.ObjectId,
    default: null
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: { createdAt: true, updatedAt: false }
})

const PostSchema = new Schema<IPost>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  imageUrl: {
    type: String
  },
  postType: {
    type: String,
    enum: ['general', 'announcement', 'event', 'complaint', 'suggestion'],
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema]
}, {
  timestamps: true
})

// Indexes
PostSchema.index({ userId: 1 })
PostSchema.index({ postType: 1 })
PostSchema.index({ createdAt: -1 })
PostSchema.index({ 'likes': 1 })

export const Post = (mongoose.models?.Post as mongoose.Model<IPost>) || mongoose.model<IPost>('Post', PostSchema)
