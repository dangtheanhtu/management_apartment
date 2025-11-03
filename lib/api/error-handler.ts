import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export class APIError extends Error {
  statusCode: number
  
  constructor(message: string, statusCode: number = 500) {
    super(message)
    this.name = 'APIError'
    this.statusCode = statusCode
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Dữ liệu không hợp lệ',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      },
      { status: 400 }
    )
  }

  // Custom API errors
  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  // MongoDB errors
  if (error instanceof Error) {
    if (error.name === 'MongoServerError') {
      const mongoError = error as any
      if (mongoError.code === 11000) {
        return NextResponse.json(
          { error: 'Dữ liệu đã tồn tại' },
          { status: 409 }
        )
      }
    }

    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'ID không hợp lệ' },
        { status: 400 }
      )
    }

    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Dữ liệu không hợp lệ', details: error.message },
        { status: 400 }
      )
    }
  }

  // Generic error
  return NextResponse.json(
    { error: 'Đã xảy ra lỗi không mong muốn' },
    { status: 500 }
  )
}

export function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    ...(message && { message }),
    ...data
  })
}

export function createErrorResponse(message: string, statusCode: number = 400) {
  return NextResponse.json(
    { error: message },
    { status: statusCode }
  )
}
