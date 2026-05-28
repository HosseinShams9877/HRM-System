import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

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
    return NextResponse.json(documents)
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json({ error: 'خطا در دریافت مدارک' }, { status: 500 })
  }
}

// POST /api/employees/[id]/documents — آپلود مدرک جدید
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    if (!body.title || !body.category || !body.fileName || !body.filePath) {
      return NextResponse.json(
        { error: 'عنوان، دسته‌بندی و فایل الزامی است' },
        { status: 400 }
      )
    }

    const document = await db.employeeDocument.create({
      data: {
        employeeId: id,
        title: body.title,
        category: body.category,
        fileName: body.fileName,
        filePath: body.filePath,
        fileType: body.fileType || 'pdf',
        fileSize: body.fileSize || 0,
        description: body.description || null,
        uploadedBy: body.uploadedBy || null,
      },
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Upload document error:', error)
    return NextResponse.json({ error: 'خطا در آپلود مدرک' }, { status: 500 })
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

    await db.employeeDocument.delete({
      where: { id: docId, employeeId: id },
    })

    return NextResponse.json({ message: 'مدرک حذف شد' })
  } catch (error) {
    console.error('Delete document error:', error)
    return NextResponse.json({ error: 'خطا در حذف مدرک' }, { status: 500 })
  }
}
