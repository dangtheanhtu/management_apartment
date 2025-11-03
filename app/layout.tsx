import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { SessionProvider } from '@/components/providers/session-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'StayEase - Hệ thống quản lý chung cư',
  description: 'Hệ thống quản lý chung cư hiện đại với tính năng quản lý cư dân, hóa đơn, thanh toán và cộng đồng',
  generator: 'StayEase Apartment System',
  keywords: ['chung cư', 'quản lý', 'cư dân', 'hóa đơn', 'thanh toán', 'cộng đồng'],
  authors: [{ name: 'StayEase Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <Toaster />
        <SonnerToaster position="top-right" richColors />
      </body>
    </html>
  )
}
