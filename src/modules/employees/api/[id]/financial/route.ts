import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/employees/[id]/financial
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    let financial = await db.employeeFinancial.findUnique({
      where: { employeeId: id },
    })
    
    if (!financial) {
      // اگر وجود نداشت، یک رکورد خالی برگردان
      financial = {
        id: '',
        employeeId: id,
        bankAccountNo: null,
        insuranceNo: null,
        laborCardNo: null,
        baseSalary: null,
        housingAllowance: null,
        workAllowance: null,
        spouseAllowance: null,
        childAllowance: null,
        yearsOfServiceBase: null,
        responsibilityAllowance: null,
        otherAllowances: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }
    
    return NextResponse.json({ data: financial })
  } catch (error) {
    console.error('Get financial error:', error)
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات مالی' }, { status: 500 })
  }
}

// POST /api/employees/[id]/financial
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    
    const financial = await db.employeeFinancial.upsert({
      where: { employeeId: id },
      update: body,
      create: { employeeId: id, ...body },
    })
    
    return NextResponse.json({ data: financial }, { status: 201 })
  } catch (error) {
    console.error('Create financial error:', error)
    return NextResponse.json({ error: 'خطا در ثبت اطلاعات مالی' }, { status: 500 })
  }
}

// PUT /api/employees/[id]/financial
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    
    const financial = await db.employeeFinancial.upsert({
      where: { employeeId: id },
      update: body,
      create: { employeeId: id, ...body },
    })
    
    return NextResponse.json({ data: financial })
  } catch (error) {
    console.error('Update financial error:', error)
    return NextResponse.json({ error: 'خطا در بروزرسانی اطلاعات مالی' }, { status: 500 })
  }
}