import { NextResponse } from 'next/server'
import { getAmenities } from '@/lib/amenities/actions'
import { handleAPIError, createSuccessResponse } from '@/lib/api/error-handler'

export async function GET() {
  try {
    const amenities = await getAmenities()
    return createSuccessResponse({ amenities })
  } catch (error) {
    return handleAPIError(error)
  }
}







