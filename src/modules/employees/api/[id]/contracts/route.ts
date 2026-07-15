
// src/app/api/employees/[id]/contracts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

// GET /api/employees/[id]/contracts - دریافت قراردادهای یک کارمند
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params

    // بررسی وجود کارمند
    const employee = await db.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'کارمند یافت نشد' },
        { status: 404 }
      )
    }

    // دریافت قراردادهای کارمند
    const contracts = await db.contract.findMany({
      where: { employeeId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            personnelCode: true,
            department: true,
            position: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: contracts,
      count: contracts.length
    })

  } catch (error) {
    console.error('Error fetching employee contracts:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت قراردادها' },
      { status: 500 }
    )
  }
}