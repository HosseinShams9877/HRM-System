import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// POST /api/payroll/batch — عملیات دسته‌ای روی فیش‌های حقوقی
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.action || !body.ids || !Array.isArray(body.ids)) {
      return NextResponse.json({ error: 'نوع عملیات و لیست شناسه‌ها الزامی است' }, { status: 400 })
    }

    const { action, ids, year, month } = body

    // اگر سال و ماه مشخص شده، آی‌دی‌ها رو خودمان پیدا می‌کنیم
    let targetIds = ids

    if (!targetIds.length && year && month) {
      const slips = await db.paySlip.findMany({
        where: {
          year: parseInt(String(year)),
          month: parseInt(String(month)),
          status: action === 'confirm' ? 'draft' : action === 'pay' ? 'confirmed' : undefined,
        },
        select: { id: true },
      })
      targetIds = slips.map(s => s.id)
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ error: 'فیش حقوقی یافت نشد' }, { status: 404 })
    }

    let updated = 0
    let errors = 0

    const validTransitions: Record<string, string> = {
      confirm: 'confirmed',
      pay: 'paid',
      close: 'closed',
      revert_to_draft: 'draft',
    }

    const newStatus = validTransitions[action]
    if (!newStatus) {
      return NextResponse.json({ error: 'عملیات نامعتبر' }, { status: 400 })
    }

    // بررسی وضعیت‌های مجاز قبل از تغییر
    for (const id of targetIds) {
      try {
        const slip = await db.paySlip.findUnique({ where: { id } })
        if (!slip) { errors++; continue }

        // بررسی انتقال مجاز
        let allowed = false
        if (action === 'confirm' && slip.status === 'draft') allowed = true
        if (action === 'pay' && slip.status === 'confirmed') allowed = true
        if (action === 'close' && slip.status === 'paid') allowed = true
        if (action === 'revert_to_draft' && slip.status === 'confirmed') allowed = true

        if (!allowed) { errors++; continue }

        await db.paySlip.update({
          where: { id },
          data: { status: newStatus },
        })
        updated++
      } catch {
        errors++
      }
    }

    return NextResponse.json({ updated, errors, total: targetIds.length })
  } catch (error) {
    console.error('Batch payroll action error:', error)
    return NextResponse.json({ error: 'خطا در عملیات دسته‌ای' }, { status: 500 })
  }
}
