// src/app/api/employees/archived/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const departmentName = searchParams.get('department') || ''  // ← این name میاد
    const exitReason = searchParams.get('exitReason') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // ساخت شرط جستجو
    const where: any = {
      status: 'inactive',
    }

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { personnelCode: { contains: search } },
      ]
    }

    // ✅ تبدیل departmentName به departmentId
    if (departmentName && departmentName !== 'all') {
      // پیدا کردن دپارتمان با name
      const dept = await db.department.findFirst({
        where: { name: departmentName },
        select: { id: true }
      })
      
      if (dept) {
        where.department = dept.id  // ← استفاده از ID
      } else {
        // اگه پیدا نشد، خود name رو امتحان کن (برای حالت‌هایی که name ذخیره شده)
        where.department = departmentName
      }
    }

    if (exitReason && exitReason !== 'all') {
      where.exitReason = exitReason
    }

    if (startDate && endDate) {
      where.updatedAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    } else if (startDate) {
      where.updatedAt = { gte: new Date(startDate) }
    } else if (endDate) {
      where.updatedAt = { lte: new Date(endDate) }
    }

    // لاگ برای دیباگ
    console.log('🔍 departmentName received:', departmentName)
    console.log('🔍 where.department:', where.department)

    const total = await db.employee.count({ where })

    const employees = await db.employee.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        personnelCode: true,
        position: true,
        department: true,
        updatedAt: true,
        exitReason: true,
        hireDate: true,
      },
      orderBy: { updatedAt: 'desc' },
      skip,
      take: limit,
    })

    let stats = null
    if (page === 1) {
      const allEmployees = await db.employee.findMany({
        where,
        select: { exitReason: true, updatedAt: true }
      })
      const currentYear = new Date().getFullYear()
      stats = {
        totalArchived: allEmployees.length,
        contractEnd: allEmployees.filter(e => e.exitReason === 'contract_end').length,
        resignation: allEmployees.filter(e => e.exitReason === 'resignation').length,
        retirement: allEmployees.filter(e => e.exitReason === 'retirement').length,
        currentYearExits: allEmployees.filter(e => {
          if (!e.updatedAt) return false
          return new Date(e.updatedAt).getFullYear() === currentYear
        }).length
      }
    }

    const formatted = employees.map(emp => ({
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      personnelCode: emp.personnelCode,
      lastPosition: emp.position || 'نامشخص',
      department: emp.department || 'نامشخص',
      exitDate: emp.updatedAt?.toISOString() || new Date().toISOString(),
      exitReason: emp.exitReason || 'other',
      status: 'archived' as const,
      employmentDate: emp.hireDate,
    }))

    return NextResponse.json({
      success: true,
      data: formatted,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      count: formatted.length,
    })

  } catch (error) {
    console.error('Error fetching archived employees:', error)
    return NextResponse.json(
      { success: false, error: 'خطا در دریافت آرشیو کارکنان' },
      { status: 500 }
    )
  }
}