import { NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import bcrypt from 'bcryptjs'

// GET /api/auth/seed — ایجاد/بازنشانی کاربران آزمایشی (قابل دسترسی از مرورگر)
export async function GET() {
  return seedUsers()
}

// POST /api/auth/seed — ایجاد/بازنشانی کاربران آزمایشی
export async function POST() {
  return seedUsers()
}

async function seedUsers() {
  try {
    // ═══════════════════════════════════════════
    // حذف تمام کاربران قدیمی و بازسازی از صفر
    // ═══════════════════════════════════════════
    await db.passwordReset.deleteMany({})
    await db.user.deleteMany({})

    const adminPassword = await bcrypt.hash('123456', 10)

    // ═══════════════════════════════════════════
    // ۱. ادمین — ورود با ایمیل + رمز عبور
    // ═══════════════════════════════════════════
    const employees = await db.employee.findMany({ orderBy: { createdAt: 'asc' }, take: 15 })

    await db.user.create({
      data: {
        email: 'admin@company.ir',
        password: adminPassword,
        role: 'admin',
        isActive: true,
        mobile: null,
        isFirstLogin: false, // ادمین اولین ورود ندارد
      }
    })

    // ═══════════════════════════════════════════
    // ۲. کارمندان — ورود با موبایل + کد ملی
    //    رمز عبور اولیه = هش کد ملی کارمند
    //    isFirstLogin = true → اجبار تغییر رمز بعد از اولین ورود
    // ═══════════════════════════════════════════
    const roleMap: Record<number, string> = {
      0: 'hr_manager',   // محمد احمدی — مدیر منابع انسانی
      5: 'hr_manager',   // فاطمه نوری — کارشناس منابع انسانی
      11: 'manager',     // لیلا رحیمی — مدیر مالی
      12: 'manager',     // پویا میرزایی — مدیر فناوری اطلاعات
      3: 'manager',      // مریم حسینی — کارشناس فروش (نقش مدیر)
    }

    let employeeUsersCount = 0
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i]
      if (!emp.phone || !emp.nationalCode) continue

      // نرمال‌سازی شماره موبایل
      let mobile = emp.phone.replace(/\s/g, '')
      if (mobile.startsWith('98')) mobile = '0' + mobile.slice(2)
      if (!mobile.startsWith('0')) mobile = '0' + mobile

      // رمز عبور = هش کد ملی (اولیه — کارمند باید بعد از اولین ورود تغییر دهد)
      const password = await bcrypt.hash(emp.nationalCode, 10)
      const role = roleMap[i] || 'employee'

      await db.user.create({
        data: {
          mobile,
          password,
          role,
          isActive: true,
          employeeId: emp.id,
          isFirstLogin: true, // کارمند باید بعد از اولین ورود رمز را تغییر دهد
        }
      })
      employeeUsersCount++
    }

    // ═══════════════════════════════════════════
    // ۳. خروجی نمونه
    // ═══════════════════════════════════════════
    const sampleEmployees = employees.slice(0, 5)
    const credentials = [
      { type: 'admin', username: 'admin@company.ir', password: '123456', role: 'مدیر سیستم', hint: 'ورود با ایمیل + رمز عبور' },
      ...sampleEmployees.map((emp, i) => ({
        type: 'employee' as const,
        username: emp.phone || '',
        password: emp.nationalCode || '',
        role: roleMap[i] === 'hr_manager' ? 'مدیر منابع انسانی' : roleMap[i] === 'manager' ? 'مدیر' : 'کارمند',
        hint: 'ورود با موبایل + کد ملی (اولین ورود → تغییر رمز اجباری)',
      }))
    ]

    return NextResponse.json({
      success: true,
      message: `1 ادمین + ${employeeUsersCount} کارمند ایجاد شد`,
      note: 'کارمندان باید بعد از اولین ورود رمز عبور خود را تغییر دهند',
      credentials,
    })
  } catch (error) {
    console.error('Seed users error:', error)
    return NextResponse.json(
      { error: 'خطا در ایجاد کاربران آزمایشی', details: String(error) },
      { status: 500 }
    )
  }
}
