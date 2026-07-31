// scripts/fix-payroll-items.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const year = 1405
  
  console.log(`🔄 در حال اصلاح آیتم‌های حقوقی برای سال ${year}...`)
  console.log('═'.repeat(60))

  // ============================================
  // ۱. بروزرسانی آیتم‌های موجود به employee_field
  // ============================================
  
  const updates = [
    {
      code: 'HOUSING',
      newCode: 'HOUSING_ALLOWANCE',
      title: 'حق مسکن',
      employeeField: 'housingAllowance',
    },
    {
      code: 'FOOD',
      newCode: 'FOOD_ALLOWANCE',
      title: 'حق خواربار',
      employeeField: 'workAllowance',
    },
    {
      code: 'MARITAL_ALLOWANCE',
      newCode: 'SPOUSE_ALLOWANCE',
      title: 'حق تاهل',
      employeeField: 'spouseAllowance',
    },
    {
      code: 'CHILD_ALLOWANCE',
      newCode: 'CHILD_ALLOWANCE',
      title: 'حق اولاد',
      employeeField: 'childAllowance',
    },
  ]

  for (const update of updates) {
    const existing = await prisma.payrollItem.findFirst({
      where: {
        code: update.code,
        year: year,
      },
    })

    if (existing) {
      // اگر کد جدید با کد قدیم فرق داره، اول کد رو عوض کن
      if (update.newCode !== update.code) {
        await prisma.payrollItem.update({
          where: { id: existing.id },
          data: {
            code: update.newCode,
            title: update.title,
            calculationType: 'employee_field',
            employeeField: update.employeeField,
            value: 0,
            isInsurable: false,
            isTaxable: false,
            isEditable: true,
            isSystem: true,
            isActive: true,
          },
        })
        console.log(`🔄 بروزرسانی شد: ${update.code} → ${update.newCode} (${update.title})`)
      } else {
        await prisma.payrollItem.update({
          where: { id: existing.id },
          data: {
            title: update.title,
            calculationType: 'employee_field',
            employeeField: update.employeeField,
            value: 0,
            isInsurable: false,
            isTaxable: false,
            isEditable: true,
            isSystem: true,
            isActive: true,
          },
        })
        console.log(`🔄 بروزرسانی شد: ${update.code} (${update.title})`)
      }
    } else {
      console.log(`⚠️ آیتم ${update.code} پیدا نشد`)
    }
  }

  // ============================================
  // ۲. اضافه کردن آیتم‌های جدید
  // ============================================
  
  const newItems = [
    {
      code: 'RESPONSIBILITY_ALLOWANCE',
      title: 'حق مسئولیت',
      category: 'allowance',
      calculationType: 'employee_field',
      employeeField: 'responsibilityAllowance',
      value: 0,
      isInsurable: false,
      isTaxable: false,
      isEditable: true,
      isSystem: true,
      sortOrder: 34,
      description: 'حق مسئولیت کارمند (از اطلاعات مالی)',
    },
    {
      code: 'OTHER_ALLOWANCES',
      title: 'سایر مزایا',
      category: 'allowance',
      calculationType: 'employee_field',
      employeeField: 'otherAllowances',
      value: 0,
      isInsurable: false,
      isTaxable: false,
      isEditable: true,
      isSystem: true,
      sortOrder: 35,
      description: 'سایر مزایای کارمند (از اطلاعات مالی)',
    },
    {
      code: 'YEARS_OF_SERVICE',
      title: 'پایه سنوات',
      category: 'allowance',
      calculationType: 'employee_field',
      employeeField: 'yearsOfServiceBase',
      value: 0,
      isInsurable: false,
      isTaxable: false,
      isEditable: true,
      isSystem: true,
      sortOrder: 36,
      description: 'پایه سنوات کارمند (از اطلاعات مالی)',
    },
  ]

  for (const item of newItems) {
    const existing = await prisma.payrollItem.findFirst({
      where: {
        code: item.code,
        year: year,
      },
    })

    if (!existing) {
      await prisma.payrollItem.create({
        data: {
          ...item,
          year,
          isActive: true,
        },
      })
      console.log(`✅ ایجاد شد: ${item.title} (${item.code})`)
    } else {
      console.log(`⏭️ از قبل وجود دارد: ${item.title} (${item.code})`)
    }
  }

  // ============================================
  // ۳. نمایش خلاصه
  // ============================================
  
  const finalItems = await prisma.payrollItem.findMany({
    where: { year },
    orderBy: [
      { category: 'asc' },
      { sortOrder: 'asc' },
    ],
  })

  console.log('═'.repeat(60))
  console.log(`📊 خلاصه نهایی:`)
  console.log(`  • کل آیتم‌ها: ${finalItems.length}`)
  console.log(`  • مزایا: ${finalItems.filter(i => i.category === 'allowance').length}`)
  console.log(`  • کسورات: ${finalItems.filter(i => i.category === 'deduction').length}`)
  console.log(`  • employee_field: ${finalItems.filter(i => i.calculationType === 'employee_field').length}`)
  console.log('✅ عملیات با موفقیت انجام شد!')
}

main()
  .catch((error) => {
    console.error('❌ خطا:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })