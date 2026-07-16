// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser, hasPermission } from '@/core/lib/auth'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

// GET /api/orders/[id] — دریافت جزئیات یک حکم
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'contract:view')) {
      return NextResponse.json({ error: 'شما اجازه دیدن این حکم را ندارید' }, { status: 403 })
    }

    const { id } = await params

    const order = await db.order.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            personnelCode: true,
      
          },
        },
        contract: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'حکم یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json({ error: 'خطا در دریافت حکم' }, { status: 500 })
  }
}

// PUT /api/orders/[id] — ویرایش حکم (با آپلود فایل جدید)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }
    if (!hasPermission(sessionUser.role, 'contract:update')) {
      return NextResponse.json({ error: 'شما اجازه ویرایش این حکم را ندارید' }, { status: 403 })
    }

    const { id } = await params

    // ✅ دریافت FormData
    const formData = await req.formData()
    
    // گرفتن فایل
    const file = formData.get('file') as File | null
    
    // گرفتن بقیه فیلدها
    const orderType = formData.get('orderType') as string
    const employeeId = formData.get('employeeId') as string
    const title = formData.get('title') as string
    const orderNumber = formData.get('orderNumber') as string
    const issueDate = formData.get('issueDate') as string
    const effectiveDate = formData.get('effectiveDate') as string
    const description = formData.get('description') as string
    const status = formData.get('status') as string || 'draft'
    const newPosition = formData.get('newPosition') as string || null
    const newDepartment = formData.get('newDepartment') as string || null
    const newManagerId = formData.get('newManagerId') as string || null
    const baseSalary = formData.get('baseSalary') as string || null
    const housingAllowance = formData.get('housingAllowance') as string || null
    const foodAllowance = formData.get('foodAllowance') as string || null
    const attractionAllowance = formData.get('attractionAllowance') as string || null
    const responsibilityAllowance = formData.get('responsibilityAllowance') as string || null
    const otherAllowances = formData.get('otherAllowances') as string || null
    const fixedDeductions = formData.get('fixedDeductions') as string || null
    const contractId = formData.get('contractId') as string || null
    const spouseAllowance = formData.get('spouseAllowance') as string || null
const childAllowance = formData.get('childAllowance') as string || null
const yearsOfServiceBase = formData.get('yearsOfServiceBase') as string || null


    // چک کردن وجود حکم
    const existingOrder = await db.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'حکم یافت نشد' }, { status: 404 })
    }

    // چک کردن تکراری نبودن شماره حکم
    if (orderNumber && orderNumber !== existingOrder.orderNumber) {
      const duplicateOrder = await db.order.findUnique({
        where: { orderNumber },
      })
      if (duplicateOrder) {
        return NextResponse.json(
          { error: 'شماره حکم تکراری است' },
          { status: 409 }
        )
      }
    }

    // ✅ ذخیره فایل جدید (اگه وجود داشته باشه)
    let fileUrl: string | null = existingOrder.fileUrl
    let fileName: string | null = existingOrder.fileName

    if (file) {
      try {
        // حذف فایل قبلی (اگه وجود داشته باشه)
        if (existingOrder.fileUrl) {
          try {
            const oldFilePath = path.join(process.cwd(), 'public', existingOrder.fileUrl)
            await unlink(oldFilePath).catch(() => {})
          } catch (e) {
            // خطای حذف فایل قبلی رو نادیده بگیر
          }
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'orders')
        await mkdir(uploadDir, { recursive: true })

        const timestamp = Date.now()
        const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
        const filePath = path.join(uploadDir, safeFileName)

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        await writeFile(filePath, buffer)

        fileUrl = `/uploads/orders/${safeFileName}`
        fileName = file.name
      } catch (error) {
        console.error('File upload error:', error)
      }
    }

    // بروزرسانی حکم
    const order = await db.order.update({
      where: { id },
      data: {
        orderType,
        employeeId,
        title,
        orderNumber,
        issueDate,
        effectiveDate,
        description: description || null,
        status,
        newPosition: newPosition || null,
        newDepartment: newDepartment || null,
        newManagerId: newManagerId || null,
        baseSalary: baseSalary ? parseFloat(baseSalary) : null,
        housingAllowance: housingAllowance ? parseFloat(housingAllowance) : null,
        foodAllowance: foodAllowance ? parseFloat(foodAllowance) : null,
        attractionAllowance: attractionAllowance ? parseFloat(attractionAllowance) : null,
        responsibilityAllowance: responsibilityAllowance ? parseFloat(responsibilityAllowance) : null,
        otherAllowances: otherAllowances ? parseFloat(otherAllowances) : null,
        fixedDeductions: fixedDeductions ? parseFloat(fixedDeductions) : null,
        contractId: contractId || null,
        spouseAllowance: spouseAllowance ? parseFloat(spouseAllowance) : null,
  childAllowance: childAllowance ? parseFloat(childAllowance) : null,
  yearsOfServiceBase: yearsOfServiceBase ? parseFloat(yearsOfServiceBase) : null,
        fileUrl,
        fileName,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            personnelCode: true,
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'خطا در ویرایش حکم', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/orders/[id] — حذف حکم
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
      return NextResponse.json({ error: 'شما اجازه حذف این حکم را ندارید' }, { status: 403 })
    }

    const { id } = await params

    // چک کردن وجود حکم و گرفتن اطلاعات فایل
    const existingOrder = await db.order.findUnique({
      where: { id },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: 'حکم یافت نشد' }, { status: 404 })
    }

    // حذف فایل از دیسک (اگه وجود داشته باشه)
    if (existingOrder.fileUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', existingOrder.fileUrl)
        await unlink(filePath).catch(() => {})
      } catch (e) {
        // خطای حذف فایل رو نادیده بگیر
      }
    }

    // حذف از دیتابیس
    await db.order.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'حکم با موفقیت حذف شد' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete order error:', error)
    return NextResponse.json({ error: 'خطا در حذف حکم' }, { status: 500 })
  }
}