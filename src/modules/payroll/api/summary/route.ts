import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/payroll/summary — خلاصه داشبورد حقوقی
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || '0')
    const month = searchParams.get('month')

    const where: Record<string, unknown> = {}
    if (year) where.year = year
    if (month) where.month = parseInt(month)

    // دریافت تمام فیش‌های حقوقی با اطلاعات کارمند
    const payslips = await db.paySlip.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            department: true,
          },
        },
      },
    })

    // ─── محاسبه جمع کل ───
    const totals = {
      totalBaseSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalGrossSalary: 0,
      totalNetSalary: 0,
      count: payslips.length,
    }

    for (const slip of payslips) {
      totals.totalBaseSalary += slip.baseSalary
      totals.totalAllowances += slip.totalAllowances
      totals.totalDeductions += slip.totalDeductions
      totals.totalGrossSalary += slip.grossSalary
      totals.totalNetSalary += slip.netSalary
    }

    // ─── شمارش بر اساس وضعیت ───
    const countByStatus: Record<string, number> = {}
    for (const slip of payslips) {
      countByStatus[slip.status] = (countByStatus[slip.status] || 0) + 1
    }

    // ─── تفکیک بر اساس دپارتمان ───
    const departmentMap = new Map<string, { department: string; count: number; totalBaseSalary: number; totalNetSalary: number }>()

    for (const slip of payslips) {
      const dept = slip.employee?.department || 'بدون دپارتمان'
      const existing = departmentMap.get(dept) || {
        department: dept,
        count: 0,
        totalBaseSalary: 0,
        totalNetSalary: 0,
      }
      existing.count++
      existing.totalBaseSalary += slip.baseSalary
      existing.totalNetSalary += slip.netSalary
      departmentMap.set(dept, existing)
    }

    const departmentBreakdown = Array.from(departmentMap.values())

    // ─── آمار اضافی ───
    const averageSalary = totals.count > 0
      ? Math.round(totals.totalNetSalary / totals.count)
      : 0

    const averageBaseSalary = totals.count > 0
      ? Math.round(totals.totalBaseSalary / totals.count)
      : 0

    return NextResponse.json({
      totals,
      countByStatus,
      departmentBreakdown,
      averages: {
        netSalary: averageSalary,
        baseSalary: averageBaseSalary,
      },
      year,
      month: month ? parseInt(month) : null,
    })
  } catch (error) {
    console.error('Get payroll summary error:', error)
    return NextResponse.json({ error: 'خطا در دریافت خلاصه حقوقی' }, { status: 500 })
  }
}
