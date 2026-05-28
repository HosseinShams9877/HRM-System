import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { SYSTEM_FORMULAS } from '../../constants'

// POST /api/payroll/seed — مقداردهی اولیه داده‌های حقوقی سال ۱۴۰۵
// تمام عناوین و مبالغ کاملاً دینامیک هستند — کاربر می‌تواند هر کدام را ویرایش کند
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const year = parseInt(String(body.year || 1405))

    // بررسی اینکه آیا قبلاً seed شده
    const existingSetting = await db.payrollSetting.findUnique({ where: { year } })
    if (existingSetting) {
      return NextResponse.json(
        { error: `تنظیمات سال ${year} قبلاً ثبت شده است. ابتدا تنظیمات را حذف کنید.` },
        { status: 409 }
      )
    }

    const existingItems = await db.payrollItem.findMany({ where: { year } })
    if (existingItems.length > 0) {
      return NextResponse.json(
        { error: `آیتم‌های حقوقی سال ${year} قبلاً ثبت شده‌اند` },
        { status: 409 }
      )
    }

    // ═══════════════════════════════════════════════════
    // ۱. ایجاد تنظیمات حقوقی سال ۱۴۰۵
    // ═══════════════════════════════════════════════════
    const minDailyWage = 5_541_850 // ریال
    const workDaysPerMonth = 30

    const setting = await db.payrollSetting.create({
      data: {
        year,
        // بخش دستمزد
        minDailyWage,
        minMonthlyWage: minDailyWage * workDaysPerMonth, // 166,255,500 ریال
        baseSalaryDefault: minDailyWage * workDaysPerMonth,
        workHoursPerDay: 8,
        workDaysPerMonth,

        // بخش بیمه
        insuranceRate: 7,              // ۷٪ سهم کارمند
        employerInsRate: 23,           // ۲۳٪ سهم کارفرما
        unemploymentInsRate: 1,        // ۱٪ بیمه بیکاری سهم کارمند
        insuranceCeilingMultiplier: 7, // سقف = ۷ برابر حداقل دستمزد ماهانه

        // ضرایب
        overtimeMultiplier: 1.4,       // ۱۴۰٪ حقوق پایه
        nightShiftMultiplier: 1.15,    // ۱۱۵٪ نوبتی
        mixedNightMultiplier: 1.35,    // ۱۳۵٪ مختلط
        fridayWorkMultiplier: 1.4,     // ۱۴۰٪ جمعه‌کاری
        holidayWorkMultiplier: 1.4,    // ۱۴۰٪ تعطیل‌کاری

        // عیدی و سنوات
        eidiMinDays: 60,
        eidiMaxDays: 90,
        sanavatRate: 2.5,              // ۲.۵ حقوق پایه به ازای هر سال سابقه
        sanavatMaxYears: 30,

        // مالیات
        taxExemptAmount: 40_000_000,   // ۴۰ میلیون تومان معافیت مالیاتی
      },
    })

    // ═══════════════════════════════════════════════════
    // ۲. ایجاد آیتم‌های حقوقی (مزایا)
    // عناوین و مبالغ کاملاً قابل تغییر توسط کاربر
    // ═══════════════════════════════════════════════════
    const allowanceItems = [
      {
        title: 'حق مسکن',
        code: 'HOUSING',
        category: 'allowance',
        calculationType: 'fixed',
        value: 30_000_000, // ۳۰ میلیون ریال
        isInsurable: false,
        isTaxable: true,
        isEditable: true,
        isSystem: false,
        sortOrder: 1,
        description: 'حق مسکن سال ۱۴۰۵ — طبق قانون کار',
      },
      {
        title: 'بن خواربار',
        code: 'FOOD',
        category: 'allowance',
        calculationType: 'fixed',
        value: 22_000_000, // ۲۲ میلیون ریال
        isInsurable: false,
        isTaxable: true,
        isEditable: true,
        isSystem: false,
        sortOrder: 2,
        description: 'بن خواربار سال ۱۴۰۵ — طبق قانون کار',
      },
      {
        title: 'حق اولاد',
        code: 'CHILD_ALLOWANCE',
        category: 'allowance',
        calculationType: 'formula',
        value: 16_625_550, // مبلغ هر فرزند — ریال
        isInsurable: false,
        isTaxable: true,
        isEditable: true,
        isSystem: false,
        sortOrder: 3,
        description: 'حق اولاد = مبلغ هر فرزند × تعداد فرزندان (فقط متأهل) — سال ۱۴۰۵',
      },
      {
        title: 'حق عائله‌مندی',
        code: 'MARITAL_ALLOWANCE',
        category: 'allowance',
        calculationType: 'fixed',
        value: 5_000_000, // ۵ میلیون ریال
        isInsurable: false,
        isTaxable: true,
        isEditable: true,
        isSystem: false,
        sortOrder: 4,
        description: 'حق عائله‌مندی (حق تأهل) سال ۱۴۰۵',
      },
      {
        title: 'اضافه‌کاری',
        code: 'OVERTIME',
        category: 'allowance',
        calculationType: 'formula',
        value: 0,
        isInsurable: true,
        isTaxable: true,
        isEditable: false,
        isSystem: true,
        sortOrder: 5,
        description: 'اضافه‌کاری = ساعتی حقوق پایه × ضریب اضافه‌کاری × ساعات اضافه‌کاری',
      },
      {
        title: 'شب‌کاری',
        code: 'NIGHT_SHIFT',
        category: 'allowance',
        calculationType: 'formula',
        value: 0,
        isInsurable: true,
        isTaxable: true,
        isEditable: false,
        isSystem: true,
        sortOrder: 6,
        description: 'شب‌کاری = ساعتی حقوق پایه × ضریب شب‌کاری × ساعات شب‌کاری',
      },
      {
        title: 'جمعه‌کاری',
        code: 'FRIDAY_WORK',
        category: 'allowance',
        calculationType: 'formula',
        value: 0,
        isInsurable: true,
        isTaxable: true,
        isEditable: false,
        isSystem: true,
        sortOrder: 7,
        description: 'جمعه‌کاری = ساعتی حقوق پایه × ضریب جمعه‌کاری × ساعات جمعه‌کاری',
      },
      {
        title: 'ماموریت',
        code: 'MISSION_ALLOWANCE',
        category: 'allowance',
        calculationType: 'formula',
        value: 0,
        isInsurable: false,
        isTaxable: true,
        isEditable: true,
        isSystem: false,
        sortOrder: 8,
        description: 'حق ماموریت = حقوق روزانه × روزهای ماموریت تأییدشده',
      },
      {
        title: 'سنوات',
        code: 'SANAVAT',
        category: 'allowance',
        calculationType: 'formula',
        value: 0,
        isInsurable: false,
        isTaxable: true,
        isEditable: false,
        isSystem: true,
        sortOrder: 9,
        description: 'سنوات = نرخ سنوات × حقوق پایه × سال سابقه کار',
      },
      {
        title: 'عیدی',
        code: 'EIDI',
        category: 'allowance',
        calculationType: 'formula',
        value: 0,
        isInsurable: false,
        isTaxable: true,
        isEditable: false,
        isSystem: true,
        sortOrder: 10,
        description: 'عیدی = حقوق پایه × روزهای عیدی (بین حداقل و حداکثر)',
      },
      {
        title: 'پاداش عملکرد',
        code: 'PERFORMANCE_BONUS',
        category: 'allowance',
        calculationType: 'formula',
        value: 0,
        isInsurable: false,
        isTaxable: true,
        isEditable: true,
        isSystem: false,
        sortOrder: 11,
        description: 'پاداش عملکرد = نمره ارزیابی × مبلغ پایه',
      },
    ]

    // ═══════════════════════════════════════════════════
    // ۳. ایجاد آیتم‌های حقوقی (کسورات)
    // ═══════════════════════════════════════════════════
    const deductionItems = [
      {
        title: 'بیمه تأمین اجتماعی (سهم کارمند)',
        code: 'INSURANCE_EMPLOYEE',
        category: 'deduction',
        calculationType: 'formula',
        value: 0,
        isInsurable: false,
        isTaxable: false,
        isEditable: false,
        isSystem: true,
        sortOrder: 1,
        description: 'بیمه سهم کارمند = نرخ بیمه × مبلغ مشمول بیمه (با سقف)',
      },
      {
        title: 'مالیات بر درآمد',
        code: 'TAX',
        category: 'deduction',
        calculationType: 'formula',
        value: 0,
        isInsurable: false,
        isTaxable: false,
        isEditable: false,
        isSystem: true,
        sortOrder: 2,
        description: 'مالیات تصاعدی بر اساس پله‌های مالیاتی',
      },
      {
        title: 'کسر مرخصی بدون حقوق',
        code: 'UNPAID_LEAVE',
        category: 'deduction',
        calculationType: 'formula',
        value: 0,
        isInsurable: false,
        isTaxable: false,
        isEditable: false,
        isSystem: true,
        sortOrder: 3,
        description: 'کسر روزهای بدون حقوق = حقوق روزانه × تعداد روزها',
      },
      {
        title: 'قسط وام',
        code: 'LOAN_INSTALLMENT',
        category: 'deduction',
        calculationType: 'formula',
        value: 0,
        isInsurable: false,
        isTaxable: false,
        isEditable: true,
        isSystem: false,
        sortOrder: 4,
        description: 'قسط وام/مساعده فعال = مبلغ وام / تعداد اقساط',
      },
    ]

    // ایجاد همه آیتم‌ها
    const allItems = [...allowanceItems, ...deductionItems]
    for (const item of allItems) {
      await db.payrollItem.create({
        data: {
          title: item.title,
          code: item.code,
          category: item.category,
          calculationType: item.calculationType,
          value: item.value,
          // formulaId بعد از ساخت فرمول متصل می‌شود
          isInsurable: item.isInsurable,
          isTaxable: item.isTaxable,
          isEditable: item.isEditable,
          isSystem: item.isSystem,
          sortOrder: item.sortOrder,
          isActive: true,
          year,
          description: item.description,
        },
      })
    }

    // ═══════════════════════════════════════════════════
    // ۳.۵. ایجاد فرمول‌های سیستمی و اتصال به آیتم‌ها
    // ═══════════════════════════════════════════════════
    const formulaCodeToItemCode: Record<string, string> = {
      insurance_employee: 'INSURANCE_EMPLOYEE',
      tax_progressive: 'TAX',
      family_per_child: 'CHILD_ALLOWANCE',
      overtime_hours: 'OVERTIME',
      night_shift_hours: 'NIGHT_SHIFT',
      mixed_night_hours: 'MIXED_NIGHT_SHIFT',
      friday_work_hours: 'FRIDAY_WORK',
      holiday_hours: 'HOLIDAY_WORK',
      mission_days: 'MISSION_ALLOWANCE',
      sanavat: 'SANAVAT',
      eidi: 'EIDI',
      performance_bonus: 'PERFORMANCE_BONUS',
      unpaid_leave_days: 'UNPAID_LEAVE',
      loan_installment: 'LOAN_INSTALLMENT',
    }

    for (const def of SYSTEM_FORMULAS) {
      const formula = await db.salaryFormula.create({
        data: {
          code: def.code,
          name: def.name,
          description: def.description,
          expression: def.expression,
          year,
          isActive: true,
          variables: {
            create: def.variables.map(v => ({
              varName: v.varName,
              sourceType: v.sourceType,
              sourceId: v.sourceId,
              label: v.label,
            })),
          },
        },
      })

      // اتصال فرمول به آیتم حقوقی مربوطه
      const itemCode = formulaCodeToItemCode[def.code]
      if (itemCode) {
        await db.payrollItem.updateMany({
          where: { code: itemCode, year },
          data: { formulaId: formula.id },
        })
      }
    }

    // ═══════════════════════════════════════════════════
    // ۴. ایجاد پله‌های مالیاتی سال ۱۴۰۵
    // ═══════════════════════════════════════════════════
    const taxBrackets1405 = [
      { orderNum: 1, minAmount: 0,           maxAmount: 40_000_000,   rate: 0 },   // معاف
      { orderNum: 2, minAmount: 40_000_000,  maxAmount: 100_000_000,  rate: 10 },  // ۱۰٪
      { orderNum: 3, minAmount: 100_000_000, maxAmount: 200_000_000,  rate: 15 },  // ۱۵٪
      { orderNum: 4, minAmount: 200_000_000, maxAmount: 400_000_000,  rate: 20 },  // ۲۰٪
      { orderNum: 5, minAmount: 400_000_000, maxAmount: 0,            rate: 30 },  // ۳۰٪ (بدون سقف)
    ]

    for (const bracket of taxBrackets1405) {
      await db.taxBracket.create({
        data: {
          year,
          orderNum: bracket.orderNum,
          minAmount: bracket.minAmount,
          maxAmount: bracket.maxAmount,
          rate: bracket.rate,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `داده‌های حقوقی سال ${year} با موفقیت ایجاد شد`,
      data: {
        setting: true,
        allowanceItems: allowanceItems.length,
        deductionItems: deductionItems.length,
        formulas: SYSTEM_FORMULAS.length,
        taxBrackets: taxBrackets1405.length,
      },
    }, { status: 201 })
  } catch (error) {
    console.error('Seed payroll error:', error)
    return NextResponse.json({ error: 'خطا در مقداردهی اولیه داده‌های حقوقی' }, { status: 500 })
  }
}

// DELETE /api/payroll/seed — حذف تمام داده‌های seed یک سال
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')

    if (!year) {
      return NextResponse.json({ error: 'سال الزامی است' }, { status: 400 })
    }

    const yearNum = parseInt(year)

    // حذف پله‌های مالیاتی
    await db.taxBracket.deleteMany({ where: { year: yearNum } })

    // حذف آیتم‌های حقوقی
    await db.payrollItem.deleteMany({ where: { year: yearNum } })

    // حذف تنظیمات
    await db.payrollSetting.deleteMany({ where: { year: yearNum } })

    return NextResponse.json({
      success: true,
      message: `داده‌های حقوقی سال ${yearNum} حذف شد`,
    })
  } catch (error) {
    console.error('Delete seed error:', error)
    return NextResponse.json({ error: 'خطا در حذف داده‌های حقوقی' }, { status: 500 })
  }
}
