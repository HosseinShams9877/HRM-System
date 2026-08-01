const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkFinancial() {
  try {
    const result = await prisma.employeeFinancial.findUnique({
      where: {
        employeeId: 'cmrlp2ff80001nzd4hmgid2pv'
      }
    })
    console.log('📊 نتیجه:')
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('❌ خطا:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkFinancial()