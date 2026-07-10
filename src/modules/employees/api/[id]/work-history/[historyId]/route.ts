// src/app/api/employees/[id]/work-history/[historyId]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import {convertPersianToGregorian} from '@/core/lib/utils-fa'
// ============================================
// GET: دریافت یک سابقه شغلی خاص
// ============================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; historyId: string }> }
) {
  try {
    const { id: employeeId, historyId } = await params

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

    // دریافت سابقه شغلی
    const workHistory = await db.workHistory.findFirst({
      where: {
        id: historyId,
        employeeId: employeeId
      }
    })

    if (!workHistory) {
      return NextResponse.json(
        { success: false, error: 'سابقه شغلی یافت نشد' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: workHistory
    })

  } catch (error) {
    console.error('Error fetching work history:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت سابقه شغلی' },
      { status: 500 }
    )
  }
}

// ============================================
// PUT: ویرایش یک سابقه شغلی خاص
// ============================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; historyId: string }> }
) {
  try {
    const { id: employeeId, historyId } = await params
    
    const body = await req.json()
    const {
      position,
      department,
      startDate,
      endDate,
      description,
      isCurrent
    } = body

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

    // بررسی وجود سابقه
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

    // ✅ تبدیل تاریخ‌ها
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

    // شروع تراکنش
    const result = await db.$transaction(async (tx) => {
      
      // اگر سابقه جدید جاری هست و سابقه قبلی جاری نبوده
      if (isCurrent && !existing.isCurrent) {
        // بستن سابقه جاری قبلی
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
            endDate: new Date() // تاریخ امروز
          }
        })
      }

      // ✅ به‌روزرسانی سابقه با تاریخ‌های تبدیل شده
      const updated = await tx.workHistory.update({
        where: { id: historyId },
        data: {
          position: position !== undefined ? position : existing.position,
          department: department !== undefined ? department : existing.department,
          startDate: startDateObj || existing.startDate,
          endDate: endDateObj || existing.endDate,
          description: description !== undefined ? description : existing.description,
          isCurrent: isCurrent !== undefined ? isCurrent : existing.isCurrent
        }
      })

      // اگر سابقه جاری هست، اطلاعات کارمند رو آپدیت کن
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

// ============================================
// DELETE: حذف سابقه شغلی
// ============================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; historyId: string }> }
) {
  try {
    const { id: employeeId, historyId } = await params

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

    // بررسی وجود سابقه
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

    // اگر سابقه جاری هست، اجازه حذف نده
    if (existing.isCurrent) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'نمی‌توان سابقه شغلی جاری را حذف کرد. ابتدا سابقه جدید جایگزین کنید.' 
        },
        { status: 400 }
      )
    }

    // حذف سابقه
    await db.workHistory.delete({
      where: { id: historyId }
    })

    return NextResponse.json({
      success: true,
      message: 'سابقه شغلی با موفقیت حذف شد'
    })

  } catch (error) {
    console.error('Error deleting work history:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در حذف سابقه شغلی' },
      { status: 500 }
    )
  }
}