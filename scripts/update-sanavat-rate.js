// scripts/update-sanavat-rate.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function updateSanavatRate() {
  try {
    console.log('📊 در حال بروزرسانی sanavatRate...')

    // ۱. چک کن تنظیمات برای سال ۱۴۰۵ وجود داره
    const existing = await prisma.payrollSetting.findUnique({
      where: { year: 1405 }
    })

    if (!existing) {
      console.log('⚠️ تنظیمات برای سال ۱۴۰۵ وجود ندارد!')
      console.log('📌 لطفاً ابتدا seed رو اجرا کنید.')
      return
    }

    console.log('📊 تنظیمات فعلی:')
    console.log(`   sanavatRate: ${existing.sanavatRate}`)
    console.log(`   sanavatMaxYears: ${existing.sanavatMaxYears}`)

    // ۲. آپدیت sanavatRate
    const result = await prisma.payrollSetting.update({
      where: { year: 1405 },
      data: {
        sanavatRate: 3,
        sanavatMaxYears: 30
      }
    })

    console.log('✅ sanavatRate با موفقیت آپدیت شد:')
    console.log(`   sanavatRate: ${result.sanavatRate}`)
    console.log(`   sanavatMaxYears: ${result.sanavatMaxYears}`)

  } catch (error) {
    console.error('❌ خطا:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateSanavatRate()