import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { connectDB } from '@/lib/mongodb/connection'
import { User } from '@/lib/mongodb/models'

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return null
    }

    await connectDB()
    
    const user = await User.findById(session.user.id).select('-password')
    
    if (!user) {
      return null
    }

    return {
      id: user._id.toString(),
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || null,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl || null,
      apartmentId: user.apartmentId?.toString()
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
  
  return user
}
