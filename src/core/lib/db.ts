import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// ✅ فقط در محیط development لاگ نشون بده
const isDevelopment = process.env.NODE_ENV === 'development'

console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 30) + '...')

// ✅ تنظیمات برای هر دو محیط (SQLite و PostgreSQL)
export const db = globalForPrisma.prisma ?? new PrismaClient({
  log: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  // ✅ این رو اضافه کن تا با هر دو دیتابیس کار کنه
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
})

// ✅ برای جلوگیری از ایجاد multiple instances در development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}