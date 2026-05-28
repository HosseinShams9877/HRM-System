import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await db.offboarding.findUnique({ where: { id }, include: { employee: true } })
    if (!item) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
    return NextResponse.json(item)
  } catch (error) { return NextResponse.json({ error: 'خطا' }, { status: 500 }) }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const existing = await db.offboarding.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
    const item = await db.offboarding.update({ where: { id }, data: body })
    return NextResponse.json(item)
  } catch (error) { return NextResponse.json({ error: 'خطا' }, { status: 500 }) }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.offboarding.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'یافت نشد' }, { status: 404 })
    await db.offboarding.delete({ where: { id } })
    return NextResponse.json({ message: 'حذف شد' })
  } catch (error) { return NextResponse.json({ error: 'خطا' }, { status: 500 }) }
}
