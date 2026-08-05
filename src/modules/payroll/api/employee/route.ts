import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const employeeId = sessionUser.employeeId || sessionUser.id

    console.log('🔍 sessionUser:', {
      id: sessionUser.id,
      employeeId: sessionUser.employeeId,
      role: sessionUser.role,
      usedId: employeeId
    })

    if (!employeeId) {
      return NextResponse.json({ error: 'کارمند یافت نشد' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const month = searchParams.get('month')

    const where: Record<string, unknown> = {
      employeeId: employeeId,
    }

    if (year) where.year = parseInt(year)
    if (month) where.month = parseInt(month)

    const payslips = await db.paySlip.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            personnelCode: true,
            avatar: true,
            department: true,
            position: true,
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' },
      ],
    })

    const summary = {
      totalBaseSalary: 0,
      totalAllowances: 0,
      totalDeductions: 0,
      totalNetSalary: 0,
      count: payslips.length,
      byStatus: {} as Record<string, number>,
    }

    for (const slip of payslips) {
      summary.totalBaseSalary += slip.baseSalary
      summary.totalAllowances += slip.totalAllowances
      summary.totalDeductions += slip.totalDeductions
      summary.totalNetSalary += slip.netSalary
      summary.byStatus[slip.status] = (summary.byStatus[slip.status] || 0) + 1
    }

    return NextResponse.json({
      payslips,
      summary,
    })
    
  } catch (error) {
    console.error('❌ Get employee payslips error:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت فیش‌های حقوقی' },
      { status: 500 }
    )
  }
}
