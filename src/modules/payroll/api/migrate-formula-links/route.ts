import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { SYSTEM_FORMULAS } from '../../constants'

// POST /api/payroll/migrate-formula-links — اتصال آیتم‌های حقوقی به فرمول‌ها از طریق formulaId
// آیتم‌های فرمولی بدون formulaId را به فرمول‌های متناظر متصل می‌کند
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const year = parseInt(String(body.year || 1405))

    let formulasCreated = 0
    let formulasSkipped = 0
    let autoLinked = 0

    // ─── ۱. اطمینان از وجود فرمول‌های سیستمی ───
    for (const def of SYSTEM_FORMULAS) {
      const existing = await db.salaryFormula.findFirst({
        where: { code: def.code, year },
      })

      if (existing) {
        formulasSkipped++
        continue
      }

      await db.salaryFormula.create({
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
      formulasCreated++
    }

    // ─── ۲. دریافت همه فرمول‌های سال ───
    const formulas = await db.salaryFormula.findMany({
      where: { year },
    })
    const formulaByCode = new Map(formulas.map(f => [f.code, f]))

    // ─── ۳. مپینگ استاندارد کد آیتم حقوقی → کد فرمول ───
    // یکسان با seed.ts و API seed route
    const itemCodeToFormulaCode: Record<string, string> = {
      CHILD_ALLOWANCE: 'family_per_child',
      OVERTIME: 'overtime_hours',
      NIGHT_SHIFT: 'night_shift_hours',
      MIXED_NIGHT_SHIFT: 'mixed_night_hours',
      FRIDAY_WORK: 'friday_work_hours',
      HOLIDAY_WORK: 'holiday_hours',
      MISSION_ALLOWANCE: 'mission_days',
      INSURANCE_EMPLOYEE: 'insurance_employee',
      TAX: 'tax_progressive',
      UNPAID_LEAVE: 'unpaid_leave_days',
      LOAN_INSTALLMENT: 'loan_installment',
      SANAVAT: 'sanavat',
      EIDI: 'eidi',
      PERFORMANCE_BONUS: 'performance_bonus',
    }

    // ─── ۴. اتصال آیتم‌های فرمولی بدون formulaId ───
    const unlinkedItems = await db.payrollItem.findMany({
      where: {
        year,
        calculationType: 'formula',
        formulaId: null,
      },
    })

    const warnings: string[] = []

    for (const item of unlinkedItems) {
      const formulaCode = itemCodeToFormulaCode[item.code]
      if (!formulaCode) {
        warnings.push(`آیتم فرمولی "${item.title}" (${item.code}) بدون فرمول متناظر یافت شد`)
        continue
      }
      const formula = formulaByCode.get(formulaCode)
      if (formula) {
        await db.payrollItem.update({
          where: { id: item.id },
          data: { formulaId: formula.id },
        })
        autoLinked++
      } else {
        warnings.push(`فرمول "${formulaCode}" برای آیتم "${item.title}" یافت نشد`)
      }
    }

    // ─── ۵. شمارش نهایی ───
    const totalLinked = await db.payrollItem.count({
      where: {
        year,
        calculationType: 'formula',
        formulaId: { not: null },
      },
    })

    const totalUnlinked = await db.payrollItem.count({
      where: {
        year,
        calculationType: 'formula',
        formulaId: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'مهاجرت با موفقیت انجام شد',
      data: {
        formulasCreated,
        formulasSkipped,
        autoLinked,
        totalFormulas: formulas.length,
        totalLinkedItems: totalLinked,
        totalUnlinkedItems: totalUnlinked,
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json({ error: 'خطا در مهاجرت اتصال فرمول‌ها' }, { status: 500 })
  }
}
