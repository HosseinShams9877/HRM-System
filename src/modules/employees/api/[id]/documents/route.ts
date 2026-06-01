import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

// GET /api/employees/[id]/documents — لیست مدارک کارمند
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const documents = await db.employeeDocument.findMany({
      where: { employeeId: id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: documents })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json({ error: 'خطا در دریافت مدارک' }, { status: 500 })
  }
}

// POST /api/employees/[id]/documents — آپلود مدرک جدید (با FormData)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await req.formData()
    
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const category = formData.get('category') as string
    const description = formData.get('description') as string

    // اعتبارسنجی
    if (!file || !title || !category) {
      return NextResponse.json(
        { error: 'فایل، عنوان و دسته‌بندی الزامی است' },
        { status: 400 }
      )
    }

    // خواندن فایل
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // ایجاد پوشه آپلود
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', id)
    await mkdir(uploadDir, { recursive: true })
    
    // ذخیره فایل با نام یکتا
    const timestamp = Date.now()
    const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = path.join(uploadDir, safeFileName)
    await writeFile(filePath, buffer)

    // ذخیره در دیتابیس
    const document = await db.employeeDocument.create({
      data: {
        employeeId: id,
        title,
        category,
        fileName: file.name,
        filePath: `/uploads/${id}/${safeFileName}`,
        fileType: file.name.split('.').pop()?.toLowerCase() || 'pdf',
        fileSize: file.size,
        description: description || null,
      },
    })

    return NextResponse.json({ data: document }, { status: 201 })
  } catch (error) {
    console.error('Upload document error:', error)
    return NextResponse.json({ error: 'خطا در آپلود مدرک: ' + String(error) }, { status: 500 })
  }
}



// PUT /api/employees/[id]/documents — ویرایش مدرک
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🔵 PUT request received!')
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const docId = searchParams.get('docId')
    const body = await req.json()

    if (!docId) {
      return NextResponse.json({ error: 'شناسه مدرک الزامی است' }, { status: 400 })
    }

    // بررسی وجود مدرک
    const existingDoc = await db.employeeDocument.findFirst({
      where: { id: docId, employeeId: id },
    })

    if (!existingDoc) {
      return NextResponse.json({ error: 'مدرک یافت نشد' }, { status: 404 })
    }

    // بروزرسانی مدرک
    const updatedDoc = await db.employeeDocument.update({
      where: { id: docId },
      data: {
        title: body.title,
        category: body.category,
        description: body.description,
      },
    })

    return NextResponse.json({ data: updatedDoc })
  } catch (error) {
    console.error('Update document error:', error)
    return NextResponse.json({ error: 'خطا در ویرایش مدرک' }, { status: 500 })
  }
}

// DELETE /api/employees/[id]/documents — حذف مدرک
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const docId = searchParams.get('docId')

    if (!docId) {
      return NextResponse.json({ error: 'شناسه مدرک الزامی است' }, { status: 400 })
    }

    // اول مدرک را پیدا کن تا مسیر فایل را داشته باشیم
    const doc = await db.employeeDocument.findFirst({
      where: { id: docId, employeeId: id },
    })

    if (doc) {
      // حذف فایل از دیسک (اگر وجود داشته باشد)
      try {
        const filePath = path.join(process.cwd(), 'public', doc.filePath)
        await unlink(filePath).catch(() => {})
      } catch (e) {
        // خطای حذف فایل را نادیده بگیر
      }
    }

    // حذف از دیتابیس
    await db.employeeDocument.delete({
      where: { id: docId },
    })

    return NextResponse.json({ message: 'مدرک حذف شد' })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json({ error: 'خطا در حذف مدرک' }, { status: 500 })
  }
}