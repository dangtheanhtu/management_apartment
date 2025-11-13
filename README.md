# 🏢 StayEase - Apartment Management System# asm


> Modern, full-featured apartment management system built with Next.js 15, TypeScript, and MongoDB

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-FF6B35?logo=tailwind-css)](https://tailwindcss.com/)

## ✨ Features

### 👥 Multi-Role System
- **Admin**: Full system control, user management, analytics
- **Resident**: Apartment booking, service requests, invoice payments
- **Staff**: Service request handling, maintenance management

### 🏠 Apartment Management
- ✅ Real-time apartment availability tracking
- 📊 Detailed apartment information (floor plans, amenities, pricing)
- 🖼️ Image galleries with Cloudinary integration
- 🔍 Advanced search and filtering
- 📍 Building and floor organization

### 🛠️ Service Requests
- 📝 Submit maintenance/cleaning/security requests
- 💬 Real-time chat system for each request
- 📎 File attachments support
- 🎯 Priority management (Low, Medium, High, Urgent)
- 📈 Status tracking (Pending → In Progress → Completed)

### 💰 Payment & Invoicing
- 📄 Automated invoice generation
- 💳 Multiple payment methods (Cash, Bank Transfer, E-Wallet)
- 📊 Payment history and tracking
- ⚠️ Overdue invoice alerts
- 🧾 Transaction records

### 📢 Announcements & Posts
- 📰 News and updates management
- 📌 Pinned important posts
- 🗂️ Category organization (Events, Maintenance, News)
- 👁️ View tracking

### 👥 Visitor Management
- 📝 Pre-registration system
- ✅ Approval workflow
- ⏰ Check-in/Check-out tracking
- 📱 Purpose logging (Visit, Delivery, Maintenance)

### 📊 Analytics Dashboard
- 📈 Occupancy rates
- 💵 Revenue tracking
- 🎯 Service request metrics
- 👥 User activity logs
- 📉 Visual charts with Recharts

### 🔒 Security Features
- 🔐 NextAuth.js authentication
- 🛡️ Role-based access control (RBAC)
- 📝 Access logging system
- 🔑 Secure password hashing with bcrypt
- 🚪 Session management

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database**: MongoDB + Mongoose
- **Authentication**: NextAuth.js v5
- **File Upload**: Cloudinary

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Cloudinary account

### Installation

1. **Clone and install**
```bash
git clone <repository-url>
cd stayease_apartment_system
npm install
```

2. **Setup environment variables**
```env
# .env.local
MONGODB_URI=your_mongodb_uri
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

3. **Run development server**
```bash
npm run dev
```

4. **Open** `http://localhost:3000`

## 👤 Demo Accounts

### 🔴 Admin
```
Email: admin@stayease.com
Password: 123456
```

### 🟢 Resident
```
Email: resident@stayease.com
Password: 123456
```

### 🔵 Staff
```
Email: staff@stayease.com
Password: 123456
```

## 📊 Database Models

- **Users** - Authentication & profiles
- **Apartments** - Property details
- **ServiceRequests** - Maintenance tracking
- **Messages** - Request communications
- **Invoices** - Billing management
- **Transactions** - Payment records
- **Posts** - Community announcements
- **Amenities** - Building facilities
- **Images** - File uploads
- **Visitors** - Access management

## 🎨 Design System

### Colors
- **Primary**: Coral Orange `#FF6B35`
- **Accent**: Deep Coral `#F24C3D`
- **Theme**: Modern Orange & Coral

### Features
- 🌗 Dark mode support
- 📱 Fully responsive
- ✨ Premium animations
- 🎯 Smooth transitions
- 💎 Glass morphism effects

## 📱 API Routes

- `/api/auth/*` - Authentication
- `/api/apartments/*` - Apartment CRUD
- `/api/service-requests/*` - Maintenance
- `/api/invoices/*` - Billing
- `/api/posts/*` - Announcements
- `/api/users/*` - User management

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel --prod
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push and create PR

## 📝 License

MIT License

---

**Made with ❤️ using Next.js**
