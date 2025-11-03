import mongoose from 'mongoose'

/**
 * Lean query helper - returns plain JavaScript objects instead of Mongoose documents
 * Use this for read-only operations to improve performance
 */
export function leanQuery<T>(query: mongoose.Query<any, any>): mongoose.Query<T[], any> {
  return query.lean() as mongoose.Query<T[], any>
}

/**
 * Pagination helper
 */
export interface PaginationOptions {
  page?: number
  limit?: number
  sort?: Record<string, 1 | -1>
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export async function paginate<T>(
  model: mongoose.Model<any>,
  filter: Record<string, any> = {},
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(100, Math.max(1, options.limit || 10))
  const skip = (page - 1) * limit
  const sort = options.sort || { createdAt: -1 }

  const [data, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    model.countDocuments(filter),
  ])

  const totalPages = Math.ceil(total / limit)

  return {
    data: data as T[],
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

/**
 * Bulk operations helper
 */
export async function bulkUpsert<T extends Record<string, any>>(
  model: mongoose.Model<any>,
  data: T[],
  uniqueField: keyof T
) {
  const bulkOps = data.map((item) => ({
    updateOne: {
      filter: { [uniqueField]: item[uniqueField] },
      update: { $set: item as any },
      upsert: true,
    },
  }))

  return model.bulkWrite(bulkOps)
}

/**
 * Aggregation helper with common patterns
 */
export class AggregationBuilder {
  private pipeline: any[] = []

  match(filter: Record<string, any>) {
    this.pipeline.push({ $match: filter })
    return this
  }

  lookup(from: string, localField: string, foreignField: string, as: string) {
    this.pipeline.push({
      $lookup: {
        from,
        localField,
        foreignField,
        as,
      },
    })
    return this
  }

  unwind(path: string, preserveNullAndEmptyArrays = false) {
    this.pipeline.push({
      $unwind: {
        path: `$${path}`,
        preserveNullAndEmptyArrays,
      },
    })
    return this
  }

  group(groupBy: Record<string, any>) {
    this.pipeline.push({ $group: groupBy })
    return this
  }

  sort(sortBy: Record<string, 1 | -1>) {
    this.pipeline.push({ $sort: sortBy })
    return this
  }

  project(fields: Record<string, any>) {
    this.pipeline.push({ $project: fields })
    return this
  }

  limit(count: number) {
    this.pipeline.push({ $limit: count })
    return this
  }

  skip(count: number) {
    this.pipeline.push({ $skip: count })
    return this
  }

  build() {
    return this.pipeline
  }

  async execute<T>(model: mongoose.Model<any>): Promise<T[]> {
    return model.aggregate(this.pipeline)
  }
}

/**
 * Transaction helper
 */
export async function withTransaction<T>(
  callback: (session: mongoose.ClientSession) => Promise<T>
): Promise<T> {
  const session = await mongoose.startSession()
  
  try {
    session.startTransaction()
    const result = await callback(session)
    await session.commitTransaction()
    return result
  } catch (error) {
    await session.abortTransaction()
    throw error
  } finally {
    session.endSession()
  }
}

/**
 * Safe ID conversion
 */
export function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ObjectId')
  }
  return new mongoose.Types.ObjectId(id)
}

/**
 * Check if ID is valid
 */
export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id)
}

/**
 * Soft delete helper
 */
export async function softDelete(
  model: mongoose.Model<any>,
  id: string
): Promise<boolean> {
  const result = await model.findByIdAndUpdate(
    id,
    { deletedAt: new Date(), isDeleted: true },
    { new: true }
  )
  return !!result
}

/**
 * Find by IDs efficiently
 */
export async function findByIds<T>(
  model: mongoose.Model<any>,
  ids: string[]
): Promise<T[]> {
  const objectIds = ids.map(id => toObjectId(id))
  return model.find({ _id: { $in: objectIds } }).lean()
}
