// src/app/api/candidates/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'
import bcrypt from 'bcryptjs'

// GET /api/candidates/[id] - دریافت کاندیدا
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const candidate = await db.candidate.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            jobPosting: true,
          },
        },
      },
    })

    if (!candidate) {
      return NextResponse.json({ error: 'کاندیدا یافت نشد' }, { status: 404 })
    }

    return NextResponse.json(candidate)
  } catch (error) {
    console.error('GET /api/candidates/[id] error:', error)
    return NextResponse.json({ error: 'خطا در دریافت کاندیدا' }, { status: 500 })
  }
}

// PUT /api/candidates/[id] - ویرایش کاندیدا
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const existing = await db.candidate.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'کاندیدا یافت نشد' }, { status: 404 })
    }

    const data: any = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      nationalId: body.nationalId,
      gender: body.gender,
      birthDate: body.birthDate,
      city: body.city,
      educationLevel: body.educationLevel,
      educationField: body.educationField,
      university: body.university,
      experienceYears: parseInt(body.experienceYears) || 0,
      currentCompany: body.currentCompany,
      skills: body.skills,
      linkedinUrl: body.linkedinUrl,
      portfolioUrl: body.portfolioUrl,
      resumeUrl: body.resumeUrl,
      coverLetter: body.coverLetter,
      source: body.source || 'website',
      notes: body.notes,
    }

    if (body.password) {
      data.password = await bcrypt.hash(body.password, 10)
    }

    const candidate = await db.candidate.update({
      where: { id },
      data,
    })

    return NextResponse.json(candidate)
  } catch (error) {
    console.error('PUT /api/candidates/[id] error:', error)
    return NextResponse.json({ error: 'خطا در ویرایش کاندیدا' }, { status: 500 })
  }
}

// DELETE /api/candidates/[id] - حذف کاندیدا
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const { id } = await params

    await db.candidate.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'کاندیدا با موفقیت حذف شد' })
  } catch (error) {
    console.error('DELETE /api/candidates/[id] error:', error)
    return NextResponse.json({ error: 'خطا در حذف کاندیدا' }, { status: 500 })
  }
}