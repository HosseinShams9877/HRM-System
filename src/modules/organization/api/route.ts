import { NextResponse } from 'next/server'
import { db } from '@/core/lib/db'

// GET /api/organization — ساختار سازمانی شامل دپارتمان‌ها، پست‌ها و کارکنان
export async function GET() {
  try {
    // ۱. دریافت تمام دپارتمان‌ها با روابط
    const departments = await db.department.findMany({
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: { select: { id: true, name: true, code: true } },
        positions: {
          include: {
            appointments: {
              where: { status: 'active' },
              include: {
                employee: { select: { id: true, firstName: true, lastName: true, personnelCode: true } },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // ۲. دریافت تمام کارکنان فعال برای شمارش
    const employees = await db.employee.findMany({
      where: { status: 'active' },
      select: { id: true, firstName: true, lastName: true, department: true, personnelCode: true },
    })

    // ۳. دریافت مدیران دپارتمان‌ها
    const managerIds = departments
      .map(d => d.managerId)
      .filter((id): id is string => !!id)

    const managers = managerIds.length > 0
      ? await db.employee.findMany({
          where: { id: { in: managerIds } },
          select: { id: true, firstName: true, lastName: true, personnelCode: true },
        })
      : []

    const managerMap = new Map(managers.map(m => [m.id, m]))

    // ۴. شمارش کارکنان هر دپارتمان
    const employeeCountByDept = new Map<string, number>()
    for (const emp of employees) {
      if (emp.department) {
        employeeCountByDept.set(emp.department, (employeeCountByDept.get(emp.department) || 0) + 1)
      }
    }

    // ۵. غنی‌سازی داده‌ها
    const enrichedDepartments = departments.map(dept => {
      const manager = dept.managerId ? managerMap.get(dept.managerId) : null
      const employeeCount = employeeCountByDept.get(dept.name) || 0
      const positionsCount = dept.positions.length
      const totalHeadcount = dept.positions.reduce((sum, p) => sum + p.headcount, 0)
      const totalOccupied = dept.positions.reduce(
        (sum, p) => sum + p.appointments.length, 0
      )

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        managerId: dept.managerId,
        parentId: dept.parentId,
        parent: dept.parent,
        children: dept.children,
        manager: manager ? { id: manager.id, firstName: manager.firstName, lastName: manager.lastName } : null,
        employeeCount,
        positionsCount,
        totalHeadcount,
        totalOccupied,
        positions: dept.positions.map(pos => ({
          id: pos.id,
          title: pos.title,
          code: pos.code,
          level: pos.level,
          departmentId: pos.departmentId,
          jobGrade: pos.jobGrade,
          minSalary: pos.minSalary,
          maxSalary: pos.maxSalary,
          headcount: pos.headcount,
          status: pos.status,
          occupiedCount: pos.appointments.length,
          availableCount: pos.headcount - pos.appointments.length,
          appointments: pos.appointments.map(apt => ({
            id: apt.id,
            type: apt.type,
            startDate: apt.startDate,
            employee: apt.employee,
          })),
        })),
      }
    })

    // ۶. ساخت درخت سلسله‌مراتبی
    function buildTree(depts: typeof enrichedDepartments, parentId: string | null = null): typeof enrichedDepartments {
      return depts
        .filter(d => d.parentId === parentId)
        .map(d => ({
          ...d,
          children: buildTree(depts, d.id),
        }))
    }

    const tree = buildTree(enrichedDepartments)

    // ۷. محاسبه سطح هر دپارتمان
    function getLevel(deptId: string, depts: typeof enrichedDepartments): number {
      const dept = depts.find(d => d.id === deptId)
      if (!dept || !dept.parentId) return 0
      return 1 + getLevel(dept.parentId, depts)
    }

    const departmentsWithLevel = enrichedDepartments.map(d => ({
      ...d,
      level: getLevel(d.id, enrichedDepartments),
    }))

    // ۸. آمار کلی
    const stats = {
      totalDepartments: departments.length,
      totalPositions: departments.reduce((sum, d) => sum + d.positions.length, 0),
      totalEmployees: employees.length,
      totalActivePositions: departments.reduce(
        (sum, d) => sum + d.positions.filter(p => p.status === 'active').length, 0
      ),
    }

    return NextResponse.json({
      stats,
      departments: departmentsWithLevel,
      tree,
    })
  } catch (error) {
    console.error('Get organization error:', error)
    return NextResponse.json({ error: 'خطا در دریافت اطلاعات سازمانی' }, { status: 500 })
  }
}
