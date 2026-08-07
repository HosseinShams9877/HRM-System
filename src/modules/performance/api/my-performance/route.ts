import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

export async function GET(_req: NextRequest) {
  try {
    console.log('📡 my-performance API called')

    // دریافت اطلاعات کاربر از سشن
    const sessionUser = await getSessionUser()
    console.log('📡 sessionUser:', sessionUser)

    if (!sessionUser) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 401 }
      )
    }

    // دریافت employeeId از سشن
    const employeeId = sessionUser.employeeId || sessionUser.id
    console.log('📡 employeeId:', employeeId)

    if (!employeeId) {
      return NextResponse.json(
        { error: 'کارمند یافت نشد' },
        { status: 404 }
      )
    }

    // دریافت همه ارزیابی‌های این کارمند
    const performances = await db.performance.findMany({
      where: {
        employeeId
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log('📡 Performances found:', performances.length)

    return NextResponse.json({
      data: performances,
      pagination: {
        total: performances.length
      }
    })
  } catch (error) {
    console.error('Error fetching my performances:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت عملکرد من' },
      { status: 500 }
    )
  }
}
