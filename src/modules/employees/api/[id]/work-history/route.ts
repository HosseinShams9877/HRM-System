// src/app/api/employees/[id]/work-history/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import {convertPersianToGregorian} from '@/core/lib/utils-fa'
// ============================================
// GET: دریافت سوابق شغلی یک کارمند
// ============================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise
) {
  try {
    const { id: employeeId } = await params  // ← await

    const employee = await db.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'کارمند یافت نشد' },
        { status: 404 }
      )
    }

    const workHistory = await db.workHistory.findMany({
      where: { employeeId },
      orderBy: [
        { isCurrent: 'desc' },
        { startDate: 'desc' }
      ]
    })

    return NextResponse.json({
      success: true,
      data: workHistory,
      count: workHistory.length
    })

  } catch (error) {
    console.error('Error fetching work history:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت سوابق شغلی' },
      { status: 500 }
    )
  }
}

// ============================================
// POST: ایجاد سابقه شغلی جدید
// ============================================
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params  // ← await
    const body = await req.json()

    const {
      position,
      department,
      startDate,
      endDate,
      description,
      isCurrent,
      source = 'MANUAL',
      sourceId = null
    } = body

    if (!position || !department || !startDate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'فیلدهای سمت، دپارتمان و تاریخ شروع الزامی هستند' 
        },
        { status: 400 }
      )
    }

    const employee = await db.employee.findUnique({
      where: { id: employeeId }
    })

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'کارمند یافت نشد' },
        { status: 404 }
      )
    }
    let startDateObj: Date | null = null
    let endDateObj: Date | null = null
    
    if (startDate) {
      startDateObj = convertPersianToGregorian(startDate)
      if (!startDateObj) {
        return NextResponse.json(
          { success: false, error: 'فرمت تاریخ شروع نامعتبر است' },
          { status: 400 }
        )
      }
    }
    
    if (endDate) {
      endDateObj = convertPersianToGregorian(endDate)
      if (!endDateObj) {
        return NextResponse.json(
          { success: false, error: 'فرمت تاریخ پایان نامعتبر است' },
          { status: 400 }
        )
      }
    }

    const result = await db.$transaction(async (tx) => {
      
      if (isCurrent) {
        await tx.workHistory.updateMany({
          where: {
            employeeId: employeeId,
            isCurrent: true
          },
          data: {
            isCurrent: false,
            endDate: new Date(startDate)
          }
        })
      }

      const newHistory = await tx.workHistory.create({
        data: {
          employeeId: employeeId,
          position,
          department,
          startDate: startDateObj,
          endDate: endDate ? endDateObj : null,
          description: description || '',
          isCurrent: isCurrent || false,
          source: source,
          sourceId: sourceId
        }
      })

      if (isCurrent) {
        await tx.employee.update({
          where: { id: employeeId },
          data: {
            position: position,
            department: department
          }
        })
      }

      return newHistory
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'سابقه شغلی با موفقیت ایجاد شد'
    })

  } catch (error) {
    console.error('Error creating work history:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در ایجاد سابقه شغلی' },
      { status: 500 }
    )
  }
}

// ============================================
// PUT: ویرایش سابقه شغلی (با historyId در body)
// ============================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: employeeId } = await params  // ← await
    const body = await req.json()
    const { historyId, ...updateData } = body

    if (!historyId) {
      return NextResponse.json(
        { success: false, error: 'شناسه سابقه شغلی الزامی است' },
        { status: 400 }
      )
    }

    const existing = await db.workHistory.findFirst({
      where: {
        id: historyId,
        employeeId: employeeId
      }
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'سابقه شغلی یافت نشد' },
        { status: 404 }
      )
    }

    const result = await db.$transaction(async (tx) => {
      
      if (updateData.isCurrent && !existing.isCurrent) {
        await tx.workHistory.updateMany({
          where: {
            employeeId: employeeId,
            isCurrent: true,
            NOT: {
              id: historyId
            }
          },
          data: {
            isCurrent: false,
            endDate: new Date(updateData.startDate || new Date())
          }
        })
      }

      const updated = await tx.workHistory.update({
        where: { id: historyId },
        data: {
          position: updateData.position || existing.position,
          department: updateData.department || existing.department,
          startDate: updateData.startDate ? new Date(updateData.startDate) : existing.startDate,
          endDate: updateData.endDate ? new Date(updateData.endDate) : existing.endDate,
          description: updateData.description !== undefined ? updateData.description : existing.description,
          isCurrent: updateData.isCurrent !== undefined ? updateData.isCurrent : existing.isCurrent
        }
      })

      if (updated.isCurrent) {
        await tx.employee.update({
          where: { id: employeeId },
          data: {
            position: updated.position,
            department: updated.department
          }
        })
      }

      return updated
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'سابقه شغلی با موفقیت ویرایش شد'
    })

  } catch (error) {
    console.error('Error updating work history:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در ویرایش سابقه شغلی' },
      { status: 500 }
    )
  }
}