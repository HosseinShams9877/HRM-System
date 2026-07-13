// src/app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { getSessionUser } from '@/core/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string || 'resume'

    if (!file) {
      return NextResponse.json({ error: 'فایل یافت نشد' }, { status: 400 })
    }

    // بررسی نوع فایل
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'فایل باید PDF یا Word باشد' }, { status: 400 })
    }

    // بررسی حجم فایل (حداکثر 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'حجم فایل باید کمتر از 5MB باشد' }, { status: 400 })
    }

    // ایجاد نام فایل یکتا
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).slice(2, 7)
    const ext = file.name.split('.').pop()
    const fileName = `${type}-${timestamp}-${randomStr}.${ext}`
    
    // مسیر ذخیره
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'resumes')
    await mkdir(uploadDir, { recursive: true })
    
    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)

    // آدرس عمومی فایل
    const fileUrl = `/uploads/resumes/${fileName}`

    return NextResponse.json({ 
      success: true, 
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'خطا در آپلود فایل' }, { status: 500 })
  }
}