import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser, hasPermission } from '@/core/lib/auth'

// GET /api/payroll/settings — دریافت تنظیمات حقوقی
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')

    if (year) {
      const setting = await db.payrollSetting.findUnique({
        where: { year: parseInt(year) },
      })
      return NextResponse.json({ setting })
    }

    const settings = await db.payrollSetting.findMany({
      orderBy: { year: 'desc' },
    })
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get payroll settings error:', error)
    return NextResponse.json({ error: 'خطا در دریافت تنظیمات حقوقی' }, { status: 500 })
  }
}

// POST /api/payroll/settings — ایجاد تنظیمات سال جدید
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'payroll:settings')) {
      return NextResponse.json({ error: 'شما اجازه مدیریت تنظیمات حقوقی را ندارید' }, { status: 403 })
    }

    const body = await req.json()

    if (!body.year) {
      return NextResponse.json({ error: 'سال الزامی است' }, { status: 400 })
    }

    const year = parseInt(String(body.year))

    const existing = await db.payrollSetting.findUnique({ where: { year } })
    if (existing) {
      return NextResponse.json(
        { error: 'تنظیمات این سال قبلاً ثبت شده است' },
        { status: 409 }
      )
    }

    const setting = await db.payrollSetting.create({
      data: {
        year,
        // بخش دستمزد
        minDailyWage: parseFloat(String(body.minDailyWage || 0)),
        minMonthlyWage: parseFloat(String(body.minMonthlyWage || 0)),
        baseSalaryDefault: parseFloat(String(body.baseSalaryDefault || 0)),
        workHoursPerDay: parseFloat(String(body.workHoursPerDay || 8)),
        workDaysPerMonth: parseFloat(String(body.workDaysPerMonth || 30)),
        // بخش بیمه
        insuranceRate: parseFloat(String(body.insuranceRate || 7)),
        employerInsRate: parseFloat(String(body.employerInsRate || 23)),
        unemploymentInsRate: parseFloat(String(body.unemploymentInsRate || 1)),
        insuranceCeilingMultiplier: parseFloat(String(body.insuranceCeilingMultiplier || 7)),
        // ضرایب
        overtimeMultiplier: parseFloat(String(body.overtimeMultiplier || 1.4)),
        nightShiftMultiplier: parseFloat(String(body.nightShiftMultiplier || 1.15)),
        mixedNightMultiplier: parseFloat(String(body.mixedNightMultiplier || 1.35)),
        fridayWorkMultiplier: parseFloat(String(body.fridayWorkMultiplier || 1.4)),
        holidayWorkMultiplier: parseFloat(String(body.holidayWorkMultiplier || 1.4)),
        // عیدی و سنوات
        eidiMinDays: parseInt(String(body.eidiMinDays || 60)),
        eidiMaxDays: parseInt(String(body.eidiMaxDays || 90)),
        sanavatRate: parseFloat(String(body.sanavatRate || 0)),
        sanavatMaxYears: parseFloat(String(body.sanavatMaxYears || 30)),
        // مالیات
        taxExemptAmount: parseFloat(String(body.taxExemptAmount || 0)),
      },
    })

    return NextResponse.json(setting, { status: 201 })
  } catch (error) {
    console.error('Create payroll setting error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد تنظیمات حقوقی' }, { status: 500 })
  }
}

// PUT /api/payroll/settings — بروزرسانی تنظیمات
export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'payroll:settings')) {
      return NextResponse.json({ error: 'شما اجازه مدیریت تنظیمات حقوقی را ندارید' }, { status: 403 })
    }

    const body = await req.json()

    if (!body.year) {
      return NextResponse.json({ error: 'سال الزامی است' }, { status: 400 })
    }

    const year = parseInt(String(body.year))

    const existing = await db.payrollSetting.findUnique({ where: { year } })
    if (!existing) {
      return NextResponse.json(
        { error: 'تنظیمات این سال یافت نشد. ابتدا ایجاد کنید.' },
        { status: 404 }
      )
    }

    const parseNum = (val: unknown, def: number) =>
      val !== undefined && val !== null ? parseFloat(String(val)) : undefined

    const parseInt2 = (val: unknown, def: number) =>
      val !== undefined && val !== null ? parseInt(String(val)) : undefined

    const setting = await db.payrollSetting.update({
      where: { year },
      data: {
        // بخش دستمزد
        minDailyWage: parseNum(body.minDailyWage, 0),
        minMonthlyWage: parseNum(body.minMonthlyWage, 0),
        baseSalaryDefault: parseNum(body.baseSalaryDefault, 0),
        workHoursPerDay: parseNum(body.workHoursPerDay, 8),
        workDaysPerMonth: parseNum(body.workDaysPerMonth, 30),
        // بخش بیمه
        insuranceRate: parseNum(body.insuranceRate, 7),
        employerInsRate: parseNum(body.employerInsRate, 23),
        unemploymentInsRate: parseNum(body.unemploymentInsRate, 1),
        insuranceCeilingMultiplier: parseNum(body.insuranceCeilingMultiplier, 7),
        // ضرایب
        overtimeMultiplier: parseNum(body.overtimeMultiplier, 1.4),
        nightShiftMultiplier: parseNum(body.nightShiftMultiplier, 1.15),
        mixedNightMultiplier: parseNum(body.mixedNightMultiplier, 1.35),
        fridayWorkMultiplier: parseNum(body.fridayWorkMultiplier, 1.4),
        holidayWorkMultiplier: parseNum(body.holidayWorkMultiplier, 1.4),
        // عیدی و سنوات
        eidiMinDays: parseInt2(body.eidiMinDays, 60),
        eidiMaxDays: parseInt2(body.eidiMaxDays, 90),
        sanavatRate: parseNum(body.sanavatRate, 0),
        sanavatMaxYears: parseNum(body.sanavatMaxYears, 30),
        // مالیات
        taxExemptAmount: parseNum(body.taxExemptAmount, 0),
      },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Update payroll setting error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی تنظیمات حقوقی' }, { status: 500 })
  }
}

// DELETE /api/payroll/settings — حذف تنظیمات یک سال
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')

    if (!year) {
      return NextResponse.json({ error: 'سال الزامی است' }, { status: 400 })
    }

    await db.payrollSetting.delete({ where: { year: parseInt(year) } })

    return NextResponse.json({ message: 'تنظیمات حقوقی حذف شد' })
  } catch (error) {
    console.error('Delete payroll setting error:', error)
    return NextResponse.json({ error: 'خطا در حذف تنظیمات حقوقی' }, { status: 500 })
  }
}
