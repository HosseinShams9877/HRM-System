import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getTodayShamsi } from '@/core/lib/utils-fa'
import { getSessionUser, hasPermission } from '@/core/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const contract = await db.contract.findUnique({
      where: { id },
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
    })

    if (!contract) {
      return NextResponse.json({ error: 'قرارداد یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Get contract error:', error)
    return NextResponse.json({ error: 'خطا در دریافت قرارداد' }, { status: 500 })
  }
}

// PUT /api/contracts/[id] — بروزرسانی قرارداد (تأیید، فسخ، تمدید)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const existing = await db.contract.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'قرارداد یافت نشد' }, { status: 404 })
    }

    const today = getTodayShamsi()
    const todayStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`

    let updateData: Record<string, unknown> = {}

    if (body.action === 'approve') {
      // تأیید قرارداد/حکم
      updateData = {
        status: 'active',
        approvedAt: todayStr,
      }
    } else if (body.action === 'terminate') {
      // فسخ قرارداد
      updateData = {
        status: 'terminated',
        notes: body.notes ? `${existing.notes || ''}\n[فسخ]: ${body.notes}`.trim() : existing.notes,
      }
    } else if (body.action === 'renew') {
      // تمدید قرارداد — ایجاد رکورد جدید
      const newContract = await db.contract.create({
        data: {
          employeeId: existing.employeeId,
          type: 'حکم تمدید',
          contractNumber: body.contractNumber || `C-${today.year}/${String(await db.contract.count() + 1).padStart(3, '0')}`,
          title: `تمدید: ${existing.title}`,
          startDate: body.startDate || existing.endDate || todayStr,
          endDate: body.endDate || null,
          amount: body.amount || existing.amount,
          department: existing.department,
          notes: body.notes || `تمدید قرارداد ${existing.contractNumber || existing.id}`,
          status: 'active',
        },
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
      })

      // تغییر وضعیت قرارداد قبلی به منقضی
      await db.contract.update({
        where: { id },
        data: { status: 'expired' },
      })

      return NextResponse.json({
        renewed: newContract,
        originalUpdated: { id, status: 'expired' },
      })
    } else {
      // بروزرسانی عمومی
      updateData = {
        ...(body.type && { type: body.type }),
        ...(body.contractNumber && { contractNumber: body.contractNumber }),
        ...(body.title && { title: body.title }),
        ...(body.startDate && { startDate: body.startDate }),
        ...(body.endDate !== undefined && { endDate: body.endDate || null }),
        ...(body.amount !== undefined && { amount: body.amount ? parseFloat(body.amount) : null }),
        ...(body.department !== undefined && { department: body.department }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.status && { status: body.status }),
        ...(body.filePath !== undefined && { filePath: body.filePath }),
        ...(body.content !== undefined && { content: body.content }),      
        ...(body.variables !== undefined && { variables: body.variables }),
      }
    }

    const contract = await db.contract.update({
      where: { id },
      data: updateData,
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
    })

    return NextResponse.json(contract)
  } catch (error) {
    console.error('Update contract error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی قرارداد' }, { status: 500 })
  }
}

// DELETE /api/contracts/[id] — حذف قرارداد
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'contract:delete')) {
      return NextResponse.json({ error: 'شما اجازه حذف قرارداد را ندارید' }, { status: 403 })
    }

    const { id } = await params

    const existing = await db.contract.findUnique({ 
      where: { id },
      select: { employeeId: true, status: true }
    })
    if (!existing) {
      return NextResponse.json({ error: 'قرارداد یافت نشد' }, { status: 404 })
    }

    // 🔥 اگر قرارداد فعال بود، کارمند رو غیرفعال کن
    if (existing.status === 'active') {
      await db.employee.update({
        where: { id: existing.employeeId },
        data: { status: 'inactive' },
      })
    }

    // حذف قرارداد
    await db.contract.delete({ where: { id } })

    return NextResponse.json({ 
      message: 'قرارداد حذف شد',
      employeeStatusUpdated: existing.status === 'active'
    })
  } catch (error) {
    console.error('Delete contract error:', error)
    return NextResponse.json({ error: 'خطا در حذف قرارداد' }, { status: 500 })
  }
}