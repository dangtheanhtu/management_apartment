import { NextRequest, NextResponse } from "next/server"
import { getAllUsers } from "@/lib/users/actions"
import { withAdmin } from "@/lib/api/middleware"
import { handleAPIError, createSuccessResponse, createErrorResponse } from "@/lib/api/error-handler"

export const GET = withAdmin(async (request: NextRequest, user: any) => {
  try {
    const result = await getAllUsers()
    
    if (result.error) {
      return createErrorResponse(result.error, 400)
    }

    return createSuccessResponse({ users: result.data || [] })
  } catch (error) {
    return handleAPIError(error)
  }
})
