// scripts/check-employee-id.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function check() {
  const employeeId = 'cmrlp2ff80001nzd4hmgid2pv'
  
  console.log('🔍 چک کردن employeeId:', employeeId)
  console.log('📊 طول:', employeeId.length)
  
  // 1. چک کن در جدول Employee وجود داره
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  })
  
  console.log('📊 Employee پیدا شد:', !!employee)
  if (employee) {
    console.log('  firstName:', employee.firstName)
    console.log('  lastName:', employee.lastName)
  }
  
  // 2. تعداد کل کارمندها رو ببین
  const count = await prisma.employee.count()
  console.log('📊 تعداد کل کارمندها:', count)
  
  // 3. همه کارمندها رو ببین
  const all = await prisma.employee.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      personnelCode: true
    }
  })
  console.log('📊 همه کارمندها:')
  all.forEach(emp => {
    console.log(`  ${emp.id} - ${emp.firstName} ${emp.lastName} (${emp.personnelCode})`)
  })
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect())