import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser, hasPermission } from '@/core/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await db.loanRequest.findUnique({ where: { id }, include: { employee: true } })
    if (!item) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) { return NextResponse.json({ error: 'خطا' }, { status: 500 }) }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    // RBAC: if approving, need loan:approve permission
    if (body.status === 'approved') {
      const sessionUser = await getSessionUser()
      if (!sessionUser) {
        return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
      }
      if (!hasPermission(sessionUser.role, 'loan:approve')) {
        return NextResponse.json({ error: 'شما اجازه تایید وام را ندارید' }, { status: 403 })
      }
    }

    const existing = await db.loanRequest.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
    const item = await db.loanRequest.update({ where: { id }, data: body })
    return NextResponse.json(item)
  } catch (error) { return NextResponse.json({ error: 'خطا' }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.loanRequest.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
    await db.loanRequest.delete({ where: { id } })
    return NextResponse.json({ message: 'حذف شد' })
  } catch (error) { return NextResponse.json({ error: 'خطا' }, { status: 500 }) }
}
