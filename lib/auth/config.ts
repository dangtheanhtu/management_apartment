import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb/connection'
import { User } from '@/lib/mongodb/models'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Vui lòng nhập đầy đủ thông tin')
        }

        try {
          await connectDB()
          
          console.log('[Auth] Looking for user:', credentials.email)
          const user = await User.findOne({ email: credentials.email })
          
          if (!user) {
            console.log('[Auth] User not found')
            throw new Error('Email hoặc mật khẩu không đúng')
          }

          console.log('[Auth] User found:', user.email, 'Status:', user.status)

          if (user.status !== 'active') {
            throw new Error('Tài khoản của bạn đã bị vô hiệu hóa')
          }

          console.log('[Auth] Comparing passwords...')
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          console.log('[Auth] Password valid:', isPasswordValid)
          
          if (!isPasswordValid) {
            throw new Error('Email hoặc mật khẩu không đúng')
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.fullName,
            role: user.role,
            avatarUrl: user.avatarUrl,
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.avatarUrl = user.avatarUrl
        // Xóa các field không cần thiết để giảm kích thước token
        delete token.picture
        delete token.sub
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.avatarUrl = token.avatarUrl as string | undefined
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
}
