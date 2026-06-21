// check-production-operator.js
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkProductionOperator() {
  console.log('🔍 ========== بررسی سمت اپراتور تولید ==========\n')

  try {
    // 1. پیدا کردن سمت اپراتور تولید
    const position = await prisma.position.findFirst({
      where: {
        title: 'اپراتور تولید'
      }
    })

    if (!position) {
      console.log('❌ سمت "اپراتور تولید" پیدا نشد!')
      return
    }

    console.log(`📌 سمت: ${position.title}`)
    console.log(`   ID: ${position.id}`)
    console.log(`   ظرفیت کل (headcount): ${position.headcount}`)
    console.log(`   وضعیت: ${position.status}`)

    // 2. تعداد کارمندان فعال در این سمت
    const employeeCount = await prisma.employee.count({
      where: {
        position: position.id,
        status: 'active'
      }
    })

    console.log(`\n👥 تعداد کارمندان فعال در این سمت: ${employeeCount}`)
    console.log(`   جای خالی: ${position.headcount - employeeCount}`)

    // 3. لیست کارمندان این سمت
    const employees = await prisma.employee.findMany({
      where: {
        position: position.id,
        status: 'active'
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        personnelCode: true,
        status: true
      }
    })

    if (employees.length > 0) {
      console.log(`\n📋 لیست کارمندان:`)
      employees.forEach(emp => {
        console.log(`   - ${emp.firstName} ${emp.lastName} (کد: ${emp.personnelCode})`)
      })
    } else {
      console.log(`\n📋 هیچ کارمندی در این سمت نیست.`)
    }

    // 4. بررسی آیا position به درستی ذخیره میشه
    const lastEmployee = await prisma.employee.findFirst({
      where: {
        position: position.id
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        firstName: true,
        lastName: true,
        personnelCode: true,
        position: true,
        createdAt: true
      }
    })

    if (lastEmployee) {
      console.log(`\n🕐 آخرین کارمند اضافه شده به این سمت:`)
      console.log(`   نام: ${lastEmployee.firstName} ${lastEmployee.lastName}`)
      console.log(`   کد پرسنلی: ${lastEmployee.personnelCode}`)
      console.log(`   تاریخ ایجاد: ${lastEmployee.createdAt}`)
    }

  } catch (error) {
    console.error('❌ خطا:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkProductionOperator()