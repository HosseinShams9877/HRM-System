# Enterprise HRM System - Comprehensive Human Resource Management Platform

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)
![React](https://img.shields.io/badge/React-19.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.11.1-green)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-cyan)

A complete Human Resource Management System with attendance tracking, payroll management, performance evaluation, training management, and recruitment features.

## ✨ Key Features

- 📊 **Admin Dashboard** - Real-time KPI monitoring and analytics with Recharts
- 👥 **Employee Management** - Complete personnel information and document management
- 📅 **Attendance System** - Check-in/out, leave requests, mission tracking
- 💰 **Payroll Management** - Automated salary calculation, insurance, tax
- 🎯 **Performance Evaluation** - KPI setting and periodic assessments
- 📚 **Training Management** - Course and training program management
- 🎓 **Recruitment** - Hiring and onboarding process
- 📱 **Responsive Design** - Mobile and desktop friendly
- 🔐 **Authentication** - Next-Auth with role-based access control
- 🎨 **Beautiful UI** - shadcn/ui components + Framer Motion animations

## 🛠️ Tech Stack

| Technology | Version | Description |
|------------|---------|-------------|
| **Next.js** | 16.1.1 | React framework with App Router |
| **React** | 19.0.0 | Frontend library |
| **TypeScript** | 5.0 | Programming language |
| **Prisma** | 6.11.1 | Database ORM |
| **Tailwind CSS** | 4.0 | CSS framework |
| **Next-Auth** | 4.24.11 | Authentication |
| **Recharts** | 2.15.4 | Analytics charts |
| **Framer Motion** | 12.23.2 | Advanced animations |
| **TanStack Query** | 5.100.14 | Server state management |
| **Zod** | 4.0.2 | Data validation |
| **Zustand** | 5.0.13 | State management |

## 📦 Installation & Setup

```bash
# Clone the repository
git clone https://github.com/HosseinShams9877/HRM-System.git
cd HRM-System

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Setup database
npm run db:generate
npm run db:push

# Run development server (port 4000)
npm run dev