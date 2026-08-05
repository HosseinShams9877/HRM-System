import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params

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
    console.error('Error fetching employee trainings:', error)
    return NextResponse.json(
      { error: 'خطا در دریافت دوره‌های کارمند' },
      { status: 500 }
    )
  }
}
