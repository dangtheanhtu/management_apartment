import { NextRequest, NextResponse } from "next/server"
import { getAllApartments } from "@/lib/apartments/actions"
import { withAdmin } from "@/lib/api/middleware"
import { handleAPIError, createSuccessResponse } from "@/lib/api/error-handler"

export const GET = withAdmin(async (request: NextRequest, user: any) => {
  try {
    const apartments = await getAllApartments()
    return createSuccessResponse({ apartments })
  } catch (error) {
    return handleAPIError(error)
  }
})
