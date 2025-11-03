"use server"

import { getCurrentUser } from "@/lib/auth/actions"
import { revalidatePath } from "next/cache"
import connectToDatabase from "@/lib/mongodb/connection"
import { User } from "@/lib/mongodb/models/User"

export async function updateUserProfile(data: { fullName: string; phone: string }) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    await connectToDatabase()

    await User.findByIdAndUpdate(user.id, {
      fullName: data.fullName,
      phone: data.phone,
      updatedAt: new Date(),
    })

    revalidatePath("/resident/settings")
    revalidatePath("/dashboard")

    return { success: true }
  } catch (error) {
    console.error("Error in updateUserProfile:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
