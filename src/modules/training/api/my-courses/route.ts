import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'

export async function GET(_req: NextRequest) {
  try {
    // دریافت اطلاعات کاربر از سشن
    const sessionUser = await getSessionUser()
    
    if (!sessionUser) {
      return NextResponse.json(
        { error: 'دسترسی غیرمجاز' },
        { status: 401 }
      )
    }

    // دریافت employeeId از سشن
    const employeeId = sessionUser.employeeId || sessionUser.id

    if (!employeeId) {
      return NextResponse.json(
        { error: 'کارمند یافت نشد' },
        { status: 404 }
      )
    }

    // دریافت همه ثبت‌نام‌های این کارمند در دوره‌ها
    const participants = await db.trainingParticipant.findMany({
      where: {
        employeeId
      },
      include: {
        training: {
          include: {
            participants: {
              include: {
                employee: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    personnelCode: true,
                    department: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(participants)
  } catch (error) {
    console.error('Error fetching my courses:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت دوره‌های من' },
      { status: 500 }
    )
  }
}
