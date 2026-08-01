// scripts/check-payroll-items.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  // 1. همه آیتم‌های حقوقی رو ببین
  const items = await prisma.payrollItem.findMany({
    where: { year: 1405, isActive: true },
    select: {
      id: true,
      code: true,
      title: true,
      isActive: true
    }
  })
  
  console.log('📊 آیتم‌های حقوقی فعال:')
  items.forEach(item => {
    console.log(`  ${item.id} - ${item.code} (${item.title})`)
  })
  
  // 2. چک کن آیتم‌هایی که توی درخواست هستن وجود دارن؟
  // (این رو بعد از دریافت درخواست میتونی چک کنی)
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect())