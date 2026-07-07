// src/app/api/candidates/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'
import { getSessionUser } from '@/core/lib/auth'
import bcrypt from 'bcryptjs'

// GET /api/candidates - لیست کاندیداها
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || ''
    const source = searchParams.get('source') || ''
    const search = searchParams.get('search') || ''

    const where: any = {}
    if (status) where.status = status
    if (source) where.source = source
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ]
    }

    const candidates = await db.candidate.findMany({
      where,
      include: {
        applications: {
          include: {
            jobPosting: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = candidates.map((c) => ({
      ...c,
      jobApplications: c.applications,
      _count: { jobApplications: c.applications.length },
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('GET /api/candidates error:', error)
    return NextResponse.json({ error: 'خطا در دریافت کاندیداها' }, { status: 500 })
  }
}

// POST /api/candidates - ایجاد کاندیدا
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: 'دسترسی غیرمجاز' }, { status: 401 })
    }

    const body = await req.json()

    // چک کردن تکراری نبودن ایمیل
    if (body.email) {
      const existing = await db.candidate.findUnique({
        where: { email: body.email },
      })
      if (existing) {
        return NextResponse.json({ error: 'این ایمیل قبلاً ثبت شده است' }, { status: 409 })
      }
    }

    const candidate = await db.candidate.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password ? await bcrypt.hash(body.password, 10) : null,
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
        status: 'active',
        notes: body.notes,
      },
    })

    return NextResponse.json(candidate, { status: 201 })
  } catch (error) {
    console.error('POST /api/candidates error:', error)
    return NextResponse.json({ error: 'خطا در ایجاد کاندیدا' }, { status: 500 })
  }
}