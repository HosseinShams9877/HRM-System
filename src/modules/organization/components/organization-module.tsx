'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Network, Building2, Briefcase, Users, ChevronDown, ChevronLeft,
  Loader2, ChevronRight, Search, Filter, Crown, User
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/core/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Progress } from '@/core/components/ui/progress'
import { toPersianDigits, formatCurrency } from '@/core/lib/utils-fa'

// ============================================
// Types
// ============================================

interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  position?: string | null
  departmentId?: string | null 
}

interface PositionData {
  id: string
  title: string
  code: string
  level: string | null
  departmentId: string | null
  jobGrade: string | null
  minSalary: number | null
  maxSalary: number | null
  headcount: number
  status: string
  occupiedCount: number
  availableCount: number
  appointments: { id: string; type: string; startDate: string; employee: EmployeeBasic }[]
}

interface DepartmentNode {
  id: string
  name: string
  code: string
  managerId: string | null
  parentId: string | null
  parent: { id: string; name: string; code: string } | null
  children: DepartmentNode[]
  manager: { id: string; firstName: string; lastName: string } | null
  employeeCount: number
  positionsCount: number
  totalHeadcount: number
  totalOccupied: number
  level: number
  positions: PositionData[]
  employees?: EmployeeBasic[]
}

interface OrgData {
  stats: {
    totalDepartments: number
    totalPositions: number
    totalEmployees: number
    totalActivePositions: number
  }
  departments: DepartmentNode[]
  tree: DepartmentNode[]
}

// ============================================
// Level Color Helper
// ============================================

function getLevelColor(level: number) {
  if (level === 0) return { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-300 dark:border-emerald-700', icon: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', accent: 'from-emerald-400 to-teal-500' }
  if (level === 1) return { bg: 'bg-sky-50 dark:bg-sky-950/30', border: 'border-sky-300 dark:border-sky-700', icon: 'text-sky-600 dark:text-sky-400', badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300', accent: 'from-sky-400 to-blue-500' }
  return { bg: 'bg-violet-50 dark:bg-violet-950/30', border: 'border-violet-300 dark:border-violet-700', icon: 'text-violet-600 dark:text-violet-400', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300', accent: 'from-violet-400 to-purple-500' }
}

function getLevelLabel(level: number) {
  if (level === 0) return 'مدیریت ارشد'
  if (level === 1) return 'میان‌رده'
  return 'عملیاتی'
}


// ============================================
// Org Chart Node
// ============================================

function OrgChartNode({ dept, allEmployees }: { 
  dept: DepartmentNode
  allEmployees?: EmployeeBasic[]
}) {
  const c = getLevelColor(dept.level)
  const hasChildren = dept.children.length > 0
  const hasPositions = dept.positions.length > 0

  return (
    <div className="relative flex flex-col items-center">
      {/* Card دپارتمان */}
      <div className="relative">
        {dept.level > 0 && (
          <div className="absolute -top-6 left-1/2 w-px h-6 bg-gray-300 -translate-x-1/2" />
        )}
        
        <Card
          className={`cursor-pointer hover:shadow-xl transition-all duration-200 border-2 ${c.border} ${c.bg} w-64`}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center shrink-0 shadow-md`}>
                {dept.level === 0 ? (
                  <Crown className="w-5 h-5 text-white" />
                ) : (
                  <Building2 className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold truncate">{dept.name}</h4>
                <p className="text-[10px] text-muted-foreground font-mono" dir="ltr">{dept.code}</p>
              </div>
            </div>
            
            <div className="space-y-2">
              {dept.manager && (
                <div className="flex items-center gap-2 text-[11px] bg-white/50 rounded-lg p-1.5">
                  <Users className="w-3 h-3 text-emerald-600" />
                  <span className="truncate font-medium">مدیر: {dept.manager.firstName} {dept.manager.lastName}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <Badge className={`text-[10px] px-2 py-0.5 ${c.badge}`}>
                  {getLevelLabel(dept.level)}
                </Badge>
                <div className="flex items-center gap-2 text-[11px]">
                  <Users className="w-3 h-3" />
                  <span className="font-bold">{toPersianDigits(dept.totalHeadcount)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* پست‌های سازمانی و کارمندان به عنوان فرزند */}
      {hasPositions && (
        <div className="relative mt-6 w-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-300" />
          <div className="relative pt-4">
            <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" />
            <div className="flex flex-row flex-wrap justify-center gap-6 px-4">
              {dept.positions.map(pos => (
                <div key={pos.id} className="relative flex flex-col items-center">
                  <div className="absolute -top-4 left-1/2 w-px h-4 bg-gray-300 -translate-x-1/2" />
                  
                  {/* کارت پست سازمانی */}
                  <Card className="w-56 border border-amber-200 bg-amber-50">
                    <CardContent className="p-3 text-center">
                      <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-amber-100 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-xs font-bold truncate">{pos.title}</p>
                      <p className="text-[9px] text-muted-foreground font-mono">{pos.code}</p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <Badge variant="outline" className="text-[8px]">
                          {toPersianDigits(pos.headcount)} نفر
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* کارمندانی که این پست را دارند */}
                  {pos.appointments.length > 0 && (
                    <div className="relative mt-3">
                      <div className="absolute -top-3 left-1/2 w-px h-3 bg-gray-300 -translate-x-1/2" />
                      <div className="pt-3 flex flex-col items-center gap-2">
                        {pos.appointments.map(apt => (
                          <div key={apt.id} className="relative">
                            <div className="absolute -top-3 left-1/2 w-px h-3 bg-gray-300 -translate-x-1/2" />
                            <Card className="w-48 border border-emerald-200 bg-white">
                              <CardContent className="p-2 text-center">
                                <div className="w-7 h-7 mx-auto mb-1 rounded-full bg-emerald-100 flex items-center justify-center">
                                  <User className="w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <p className="text-xs font-medium truncate">{apt.employee.firstName} {apt.employee.lastName}</p>
                                <p className="text-[9px] text-muted-foreground">{apt.type === 'main' ? 'اصلی' : 'سرپرست'}</p>
                              </CardContent>
                            </Card>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* زیرمجموعه‌های دپارتمان */}
      {hasChildren && (
        <div className="relative mt-6 w-full">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-300" />
          <div className="relative pt-4">
            <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" />
            <div className="flex flex-row flex-wrap justify-center gap-8 px-4">
              {dept.children.map((child) => (
                <div key={child.id} className="relative flex flex-col items-center">
                  <div className="absolute -top-4 left-1/2 w-px h-4 bg-gray-300 -translate-x-1/2" />
                  <OrgChartNode dept={child} allEmployees={allEmployees} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// Department Detail Panel
// ============================================

function DepartmentDetailPanel({ dept, onClose, allEmployees }: { 
  dept: DepartmentNode
  onClose: () => void
  allEmployees?: EmployeeBasic[]
}) {
  const c = getLevelColor(dept.level)
  const deptEmployees = allEmployees?.filter(emp => emp.departmentId === dept.id) || []

  return (
    <Card className={`border ${c.border}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${c.accent} flex items-center justify-center`}>
              <Building2 className="w-4 h-4 text-white" />
            </div>
            {dept.name}
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onClose}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* اطلاعات دپارتمان */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-[10px] text-muted-foreground">کد</p>
            <p className="text-xs font-mono">{dept.code}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-[10px] text-muted-foreground">سطح</p>
            <p className="text-xs">{getLevelLabel(dept.level)}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-[10px] text-muted-foreground">مدیر</p>
            <p className="text-xs truncate">{dept.manager?.firstName || '—'} {dept.manager?.lastName || ''}</p>
          </div>
          <div className="p-2 rounded-lg bg-muted/50 text-center">
            <p className="text-[10px] text-muted-foreground">تعداد پرسنل</p>
            <p className="text-xs font-bold">{toPersianDigits(dept.employeeCount)}</p>
          </div>
        </div>

        {/* پست‌های سازمانی */}
        {dept.positions.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-2 flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
              پست‌های سازمانی
            </h4>
            <div className="space-y-2">
              {dept.positions.map(pos => (
                <div key={pos.id} className="p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{pos.title}</span>
                    <Badge className={`text-[8px] ${pos.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}`}>
                      {pos.status === 'active' ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {toPersianDigits(pos.occupiedCount)}/{toPersianDigits(pos.headcount)} پر شده
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* کارمندان */}
        {deptEmployees.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-2 flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              کارمندان
            </h4>
            <div className="space-y-2">
              {deptEmployees.map(emp => (
                <div key={emp.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-emerald-700">
                      {emp.firstName[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{emp.firstName} {emp.lastName}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{emp.position || 'کارشناس'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// Tab 1: Org Chart
// ============================================

function OrgChartTab({ data }: { data: OrgData }) {
  const [allEmployees, setAllEmployees] = useState<EmployeeBasic[]>([])
  
  useEffect(() => {
    const employees: EmployeeBasic[] = []
    const collect = (dept: DepartmentNode) => {
      if (dept.employees) employees.push(...dept.employees)
      dept.children.forEach(collect)
    }
    data.tree.forEach(collect)
    setAllEmployees(employees)
  }, [data])

  if (data.tree.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-16 text-center">
          <Network className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-sm font-medium text-muted-foreground">دپارتمانی تعریف نشده است</h3>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* کارت‌های آماری - ریسپانسیو */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
  <Card className="border-0 shadow-sm">
    <CardContent className="p-3">
      <div className="flex items-center justify-end gap-2">
        <div className="text-right">
          <p className="text-base sm:text-lg font-bold text-emerald-700">{toPersianDigits(data.stats.totalDepartments)}</p>
          <p className="text-[10px] text-muted-foreground">دپارتمان</p>
        </div>
        <div className="p-1.5 rounded-lg bg-emerald-50">
          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
        </div>
      </div>
    </CardContent>
  </Card>
  <Card className="border-0 shadow-sm">
    <CardContent className="p-3">
      <div className="flex items-center justify-end gap-2">
        <div className="text-right">
          <p className="text-base sm:text-lg font-bold text-sky-700">{toPersianDigits(data.stats.totalPositions)}</p>
          <p className="text-[10px] text-muted-foreground">پست سازمانی</p>
        </div>
        <div className="p-1.5 rounded-lg bg-sky-50">
          <Briefcase className="w-3.5 h-3.5 text-sky-600" />
        </div>
      </div>
    </CardContent>
  </Card>
  <Card className="border-0 shadow-sm">
    <CardContent className="p-3">
      <div className="flex items-center justify-end gap-2">
        <div className="text-right">
          <p className="text-base sm:text-lg font-bold text-violet-700">{toPersianDigits(data.stats.totalEmployees)}</p>
          <p className="text-[10px] text-muted-foreground">کارمند</p>
        </div>
        <div className="p-1.5 rounded-lg bg-violet-50">
          <Users className="w-3.5 h-3.5 text-violet-600" />
        </div>
      </div>
    </CardContent>
  </Card>
  <Card className="border-0 shadow-sm">
    <CardContent className="p-3">
      <div className="flex items-center justify-end gap-2">
        <div className="text-right">
          <p className="text-base sm:text-lg font-bold text-amber-700">{toPersianDigits(data.stats.totalActivePositions)}</p>
          <p className="text-[10px] text-muted-foreground">پست فعال</p>
        </div>
        <div className="p-1.5 rounded-lg bg-amber-50">
          <Network className="w-3.5 h-3.5 text-amber-600" />
        </div>
      </div>
    </CardContent>
  </Card>
</div>

      {/* نمودار سازمانی - بدون اسکرول با اندازه کوچکتر */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 justify-end">
          نمودار سازمانی
            <div className="p-1.5 rounded-lg bg-emerald-50">
              <Network className="w-4 h-4 text-emerald-600" />
            </div>
           
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center pb-4" dir="rtl">
            <div className="flex flex-col items-center w-full">
              
              {/* عنوان: سازمان */}
              <div className="mb-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-bold mt-1 text-emerald-700">سازمان</h3>
                <p className="text-[8px] text-muted-foreground">دفتر مرکزی</p>
              </div>
              
              <div className="w-px h-4 bg-gray-300" />
              
              <div className="relative w-full my-2">
                <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" />
              </div>
              
              {/* دپارتمان‌ها - ریسپانسیو با wrap در موبایل */}
              <div className="flex flex-row flex-wrap justify-center gap-2 mt-2">
                {data.tree.map((dept) => (
                  <div key={dept.id} className="relative flex flex-col items-center">
                    <div className="absolute -top-5 left-1/2 w-px h-5 bg-gray-300 -translate-x-1/2" />
                    <OrgTreeNodeSmall dept={dept} allEmployees={allEmployees} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Tab 2: Department Structure
// ============================================

function DepartmentRow({ dept, depth, onSelect, isSelected }: { 
  dept: DepartmentNode
  depth: number
  onSelect: (dept: DepartmentNode) => void
  isSelected: boolean
}) {
  const [expanded, setExpanded] = useState(true)
  const c = getLevelColor(dept.level)
  const hasChildren = dept.children && dept.children.length > 0

  return (
    <>
     <TableRow 
  className={`cursor-pointer transition-all duration-200 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
    isSelected ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-r-4 border-r-emerald-500' : ''
  }`}
  onClick={() => onSelect(dept)}
>
  <TableCell className="py-2.5">
    <div className="flex items-center gap-2" style={{ paddingRight: `${depth * 24}px` }}>
      {hasChildren ? (
        <Button variant="ghost" size="sm" className="h-5 w-5 p-0 shrink-0" onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}>
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </Button>
      ) : (
        <span className="w-5 inline-block shrink-0" />
      )}
      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.accent} flex items-center justify-center shrink-0 shadow-sm`}>
        <Building2 className="w-3.5 h-3.5 text-white" />
      </div>
      <span className={`text-sm font-medium ${isSelected ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
        {dept.name}
      </span>
    </div>
  </TableCell>
  
  {/* کد - LTR با فاصله از راست */}
  <TableCell className="text-xs font-mono text-gray-500 dark:text-gray-400" dir="ltr">
    <span className="inline-block w-full text-left pl-2">{dept.code || '—'}</span>
  </TableCell>
  
  {/* مدیر واحد - با فاصله مناسب */}
  <TableCell className="text-xs text-gray-700 dark:text-gray-300">
    <span className="inline-block w-full text-center">
      {dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : '—'}
    </span>
  </TableCell>
  
  <TableCell className="text-xs text-center font-medium text-gray-700 dark:text-gray-300">
    {toPersianDigits(dept.employeeCount)}
  </TableCell>
  
  <TableCell className="text-xs text-center text-gray-500 dark:text-gray-400">
    {toPersianDigits(dept.positionsCount)}
  </TableCell>
  
  <TableCell>
    <Badge className={`text-[9px] px-2 py-0.5 rounded-full ${c.badge}`}>
      {getLevelLabel(dept.level)}
    </Badge>
  </TableCell>
</TableRow>
      {expanded && hasChildren && dept.children.map(child => (
        <DepartmentRow key={child.id} dept={child} depth={depth + 1} onSelect={onSelect} isSelected={isSelected} />
      ))}
    </>
  )
}

function DepartmentStructureTab({ data }: { data: OrgData }) {
  const [search, setSearch] = useState('')
  const [selectedDept, setSelectedDept] = useState<DepartmentNode | null>(null)
  const [activeDetailTab, setActiveDetailTab] = useState('info')

  // ✅ جمع‌آوری همه کارمندان از appointments پست‌ها
  const allEmployees: EmployeeBasic[] = []
  const collectEmployees = (dept: DepartmentNode) => {
    dept.positions.forEach(pos => {
      pos.appointments.forEach(apt => {
        if (!allEmployees.some(e => e.id === apt.employee.id)) {
          allEmployees.push({
            ...apt.employee,
            departmentId: dept.id
          })
        }
      })
    })
    dept.children.forEach(collectEmployees)
  }
  data.tree.forEach(collectEmployees)

  const filteredTree = data.tree.filter(d =>
    !search || d.name.includes(search) || d.code.includes(search)
  )

  useEffect(() => {
    if (data.tree.length > 0 && !selectedDept) {
      setSelectedDept(data.tree[0])
    }
  }, [data.tree, selectedDept])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" dir="rtl">
      {/* سمت راست: جدول دپارتمان‌ها */}
      <div className="space-y-4">
        {/* جستجو */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="جستجوی دپارتمان..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </CardContent>
        </Card>

        {/* جدول دپارتمان‌ها */}
        {data.departments.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="py-16 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <h3 className="text-sm font-medium text-muted-foreground">دپارتمانی یافت نشد</h3>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
            <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/50">
  <TableRow className="border-b border-gray-200 dark:border-gray-800">
    <TableHead className="text-right text-xs font-semibold text-gray-600 dark:text-gray-400 py-3 w-[30%]">نام دپارتمان</TableHead>
    <TableHead className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-3 w-[10%]">کد</TableHead>
    <TableHead className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-3 w-[20%]">مدیر واحد</TableHead>
    <TableHead className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-3 w-[10%]">تعداد پرسنل</TableHead>
    <TableHead className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-3 w-[10%]">پست‌ها</TableHead>
    <TableHead className="text-right pr-5 text-xs font-semibold text-gray-600 dark:text-gray-400 py-3 w-[20%]">سطح</TableHead>
  </TableRow>
</TableHeader>
  <TableBody>
    {filteredTree.map(dept => (
      <DepartmentRow 
        key={dept.id} 
        dept={dept} 
        depth={0} 
        onSelect={setSelectedDept}
        isSelected={selectedDept?.id === dept.id}
      />
    ))}
  </TableBody>
</Table>
            </div>
          </Card>
        )}
      </div>

      {/* سمت چپ: جزئیات دپارتمان */}
      <div>
        {selectedDept ? (
          <DepartmentDetailCard 
            dept={selectedDept} 
            activeTab={activeDetailTab}
            onTabChange={setActiveDetailTab}
            allEmployees={allEmployees}
          />
        ) : (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="py-16 text-center">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">یک دپارتمان را انتخاب کنید</p>
              <p className="text-xs text-muted-foreground mt-1">برای مشاهده جزئیات روی دپارتمان کلیک کنید</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// ============================================
// Tab 3: Positions
// ============================================

function PositionsTab({ data }: { data: OrgData }) {
  const [deptFilter, setDeptFilter] = useState('all')
  const [search, setSearch] = useState('')

  const allPositions = data.departments.flatMap(d =>
    d.positions.map(p => ({ 
      ...p, 
      departmentName: d.name, 
      departmentCode: d.code,
      departmentManager: d.manager  // اضافه کردن مدیر دپارتمان
    }))
  )

  const filtered = allPositions.filter(p => {
    if (deptFilter !== 'all' && p.departmentId !== deptFilter) return false
    if (search && !p.title.includes(search) && !p.code.includes(search)) return false
    return true
  })

  // پیدا کردن مدیر برای هر پست (از appointments)
  const getPositionManager = (pos: any) => {
    // مدیر اصلی که روی پست نشسته (نوع main)
    const mainAppointment = pos.appointments?.find((apt: any) => apt.type === 'main')
    if (mainAppointment) {
      return mainAppointment.employee
    }
    // اگر مدیر اصلی نبود، اولین نفری که پست رو اشغال کرده
    if (pos.appointments && pos.appointments.length > 0) {
      return pos.appointments[0].employee
    }
    return null
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* کارت‌های آماری با استایل جذاب */}
      <div className="grid grid-cols-2 pt-5 sm:grid-cols-4 gap-3">
        <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="p-3 flex items-center justify-between gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold">{toPersianDigits(filtered.length)}</p>
              <p className="text-[10px] text-white/80">کل پست‌ها</p>
            </div>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="p-3 flex items-center justify-between gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold">{toPersianDigits(filtered.filter(p => p.status === 'active').length)}</p>
              <p className="text-[10px] text-white/80">فعال</p>
            </div>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="p-3 flex items-center justify-between gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold">{toPersianDigits(filtered.reduce((s, p) => s + p.occupiedCount, 0))}</p>
              <p className="text-[10px] text-white/80">مشغول به کار</p>
            </div>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="p-3 flex items-center justify-between gap-2">
            <div className="text-right">
              <p className="text-2xl font-bold">{toPersianDigits(filtered.reduce((s, p) => s + p.availableCount, 0))}</p>
              <p className="text-[10px] text-white/80">جای خالی</p>
            </div>
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* فیلترها */}
      <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="جستجوی عنوان یا کد پست..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 pl-8 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="w-[180px] border-gray-200 dark:border-gray-700 rounded-lg">
                <SelectValue placeholder="همه دپارتمان‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دپارتمان‌ها</SelectItem>
                {data.departments.map(d => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول پست‌ها - RTL با استایل جذاب */}
      {filtered.length === 0 ? (
        <Card className="border-0 shadow-lg rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
          <CardContent className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Briefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-600 dark:text-gray-400">پست سازمانی یافت نشد</h3>
            <p className="text-xs text-gray-400 mt-1">فیلتر جستجو را تغییر دهید</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-xl rounded-xl overflow-hidden bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40">
                <TableRow className="border-b border-gray-200 dark:border-gray-800">
                  <TableHead className="text-right text-xs font-bold text-gray-700 dark:text-gray-300 py-3 w-[18%]">عنوان پست</TableHead>
                  <TableHead className="text-right text-xs font-bold text-gray-700 dark:text-gray-300 py-3 w-[8%]">کد</TableHead>
                  <TableHead className="text-right text-xs font-bold text-gray-700 dark:text-gray-300 py-3 w-[8%]">سطح</TableHead>
                  <TableHead className="text-right text-xs font-bold text-gray-700 dark:text-gray-300 py-3 w-[12%]">دپارتمان</TableHead>
                  <TableHead className="text-right text-xs font-bold text-gray-700 dark:text-gray-300 py-3 w-[12%]">مدیر مربوطه</TableHead>
                  <TableHead className="text-right text-xs font-bold text-gray-700 dark:text-gray-300 py-3 w-[8%]">گروه شغلی</TableHead>
                  <TableHead className="text-center text-xs font-bold text-gray-700 dark:text-gray-300 py-3 w-[7%]">تعداد مجاز</TableHead>
                  <TableHead className="text-center text-xs font-bold text-gray-700 dark:text-gray-300 py-3 w-[7%]">تعداد مشغول</TableHead>
                  <TableHead className="text-right text-xs font-bold text-gray-700 dark:text-gray-300 py-3 w-[12%]">حقوق</TableHead>
                  <TableHead className="text-center text-xs font-bold text-gray-700 dark:text-gray-300 py-3 w-[8%]">وضعیت</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((pos, idx) => {
                  const positionManager = getPositionManager(pos)
                  const rowBg = idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/30'
                  
                  return (
                    <TableRow 
                      key={pos.id} 
                      className={`${rowBg} hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200 group cursor-pointer`}
                    >
                      <TableCell className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Briefcase className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          </div>
                          {pos.title}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-gray-500 dark:text-gray-400" dir="ltr">{pos.code}</TableCell>
                      <TableCell>
                        {pos.level ? (
                          <Badge variant="outline" className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800">
                            {pos.level}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 rounded bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
                            <Building2 className="w-2.5 h-2.5 text-sky-600 dark:text-sky-400" />
                          </div>
                          <span className="text-xs text-gray-700 dark:text-gray-300">{pos.departmentName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {positionManager ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-sm">
                              <span className="text-[9px] font-bold text-white">
                                {positionManager.firstName?.[0]}{positionManager.lastName?.[0]}
                              </span>
                            </div>
                            <span className="text-xs text-gray-700 dark:text-gray-300">
                              {positionManager.firstName} {positionManager.lastName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400">{pos.jobGrade || '—'}</TableCell>
                      <TableCell className="text-xs text-center">
                        <span className="inline-flex items-center justify-center min-w-[40px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                          {toPersianDigits(pos.headcount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        <span className={`inline-flex items-center justify-center min-w-[40px] px-2 py-0.5 rounded-full font-medium ${
                          pos.occupiedCount > 0 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                        }`}>
                          {toPersianDigits(pos.occupiedCount)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500 dark:text-gray-400 font-mono" dir="ltr">
                        {pos.minSalary && pos.maxSalary
                          ? `${formatCurrency(pos.minSalary)} - ${formatCurrency(pos.maxSalary)}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={`text-[8px] px-2 py-0.5 rounded-full ${
                          pos.status === 'active' 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                        }`}>
                          {pos.status === 'active' ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      
    </div>
  )
}

// ============================================
// Main Organization Module
// ============================================

export function OrganizationModule({ initialTab = 'org-chart' }: { initialTab?: string }) {
  const [data, setData] = useState<OrgData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(initialTab)

  const fetchOrgData = useCallback(async () => {
    try {
      const res = await fetch('/api/organization')
      if (res.ok) {
        const json = await res.json()
        console.log('📊 API Response full:', json)
        console.log('📊 Departments:', json.departments)
        console.log('📊 First department employees:', json.departments?.[0]?.employees)
        console.log('📊 Tree structure:', json.tree)
        setData(json)
      }
    } catch (err) {
      console.error('Failed to fetch organization data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrgData()
  }, [fetchOrgData])

  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-sm">در حال بارگذاری اطلاعات سازمانی...</span>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Network className="w-8 h-8" />
          <span className="text-sm">خطا در دریافت اطلاعات سازمانی</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Network className="w-5 h-5 text-emerald-600" />
          سازمان و نمودار
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          مشاهده ساختار سازمانی، نمودار دپارتمان‌ها و پست‌های سازمانی
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="org-chart" className="gap-1.5">
            <Network className="w-3.5 h-3.5" />
            نمودار سازمانی
          </TabsTrigger>
          <TabsTrigger value="org-departments" className="gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            ساختار دپارتمان‌ها
          </TabsTrigger>
          <TabsTrigger value="org-positions" className="gap-1.5">
            <Briefcase className="w-3.5 h-3.5" />
            پست‌های سازمانی
          </TabsTrigger>
        </TabsList>

        <TabsContent value="org-chart">
          <OrgChartTab data={data} />
        </TabsContent>
        <TabsContent value="org-departments">
          <DepartmentStructureTab data={data} />
        </TabsContent>
        <TabsContent value="org-positions">
          <PositionsTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OrgRootNode({ dept }: { dept: DepartmentNode }) {
  const c = getLevelColor(dept.level)

  return (
    <div className="relative flex flex-col items-center">
      <Card
        className={`cursor-pointer hover:shadow-xl transition-all duration-200 border-2 ${c.border} ${c.bg} w-72`}
      >
        <CardContent className="p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${c.accent} flex items-center justify-center shadow-md`}>
              <Crown className="w-7 h-7 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold">{dept.name}</h4>
              <p className="text-xs text-muted-foreground font-mono">{dept.code}</p>
            </div>
          </div>
          <div className="space-y-2">
            {dept.manager && (
              <div className="flex items-center gap-2 text-xs bg-white/50 rounded-lg p-2">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>{dept.manager.firstName} {dept.manager.lastName}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Badge className={`text-[10px] px-2 py-0.5 ${c.badge}`}>
                {getLevelLabel(dept.level)}
              </Badge>
              <div className="flex items-center gap-2 text-xs">
                <Users className="w-3.5 h-3.5" />
                <span className="font-bold">{toPersianDigits(dept.totalHeadcount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OrgTreeNode({ dept, allEmployees }: { 
  dept: DepartmentNode
  allEmployees?: EmployeeBasic[]
}) {
  const c = getLevelColor(dept.level)
  const hasPositions = dept.positions.length > 0

  return (
    <div className="relative flex flex-col items-center">
      {/* کارت دپارتمان */}
      <Card
        className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${c.border} ${c.bg} w-40`}
      >
        <CardContent className="p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.accent} flex items-center justify-center shrink-0`}>
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold truncate">{dept.name}</h4>
              <p className="text-[9px] text-muted-foreground font-mono">{dept.code}</p>
            </div>
          </div>
          <div className="space-y-0.5">
            {dept.manager && (
              <div className="text-[9px] text-muted-foreground truncate">
                مدیر: {dept.manager.firstName} {dept.manager.lastName}
              </div>
            )}
            <div className="flex items-center justify-between">
              <Badge className={`text-[8px] px-1.5 py-0 ${c.badge}`}>
                {getLevelLabel(dept.level)}
              </Badge>
              <span className="text-[9px]">{toPersianDigits(dept.employeeCount)} نفر</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* پست‌های سازمانی */}
      {hasPositions && (
        <div className="relative mt-3 w-full">
          <div className="absolute -top-3 left-1/2 w-px h-3 bg-gray-300 -translate-x-1/2" />
          
          <div className="relative pt-3">
            <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" />
            
            <div className="flex flex-row justify-center gap-3 px-1">
              {dept.positions.map(pos => (
                <div key={pos.id} className="relative flex flex-col items-center">
                  <div className="absolute -top-3 left-1/2 w-px h-3 bg-gray-300 -translate-x-1/2" />
                  
                  {/* کارت پست سازمانی */}
                  <Card className="w-28 border border-amber-200 bg-amber-50">
                    <CardContent className="p-1.5 text-center">
                      <Briefcase className="w-3 h-3 mx-auto mb-1 text-amber-600" />
                      <p className="text-[9px] font-bold truncate">{pos.title}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <Badge variant="outline" className="text-[7px] px-1">
                          {toPersianDigits(pos.headcount)} نفر
                        </Badge>
                      </div>
                      
                      {/* نمایش تعداد کل کارمندان */}
                      {pos.appointments.length > 0 && (
                        <div className="text-[7px] text-muted-foreground mt-1">
                          {toPersianDigits(pos.appointments.length)} نفر مشغول
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* شاخه جداگانه برای کارمندان (حداکثر 2 نفر) */}
                  {pos.appointments.length > 0 && (
                    <div className="relative mt-2">
                      {/* خط عمودی از پست به کارمندان */}
                      <div className="absolute -top-2 left-1/2 w-px h-2 bg-gray-300 -translate-x-1/2" />
                      
                      <div className="relative pt-2">
                        {/* خط افقی بالای کارمندان */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" />
                        
                        {/* کارمندان در یک ردیف افقی */}
                        <div className="flex flex-row justify-center gap-2 px-1">
                          {pos.appointments.slice(0, 2).map(apt => (
                            <div key={apt.id} className="relative flex flex-col items-center">
                              <div className="absolute -top-2 left-1/2 w-px h-2 bg-gray-300 -translate-x-1/2" />
                              
                              {/* کارت کارمند */}
                              <Card className="w-24 border border-emerald-200 bg-white">
                                <CardContent className="p-1.5 text-center">
                                  <div className="w-5 h-5 mx-auto mb-1 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <User className="w-3 h-3 text-emerald-600" />
                                  </div>
                                  <p className="text-[8px] font-medium truncate">{apt.employee.firstName} {apt.employee.lastName}</p>
                                  <p className="text-[6px] text-muted-foreground">{apt.type === 'main' ? 'اصلی' : 'سرپرست'}</p>
                                </CardContent>
                              </Card>
                            </div>
                          ))}
                        </div>
                        
                        {/* اگر بیشتر از 2 کارمند دارد */}
                        {pos.appointments.length > 2 && (
                          <div className="text-center text-[7px] text-muted-foreground mt-1">
                            و {toPersianDigits(pos.appointments.length - 2)} نفر دیگر
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
function OrgTreeNodeSmall({ dept, allEmployees }: { 
  dept: DepartmentNode
  allEmployees?: EmployeeBasic[]
}) {
  const c = getLevelColor(dept.level)
  const hasPositions = dept.positions.length > 0

  return (
    <div className="relative flex flex-col items-center">
      {/* کارت دپارتمان - کوچکتر */}
      <Card
        className={`cursor-pointer hover:shadow-lg transition-all duration-200 border-2 ${c.border} ${c.bg} w-32`}
      >
        <CardContent className="p-1.5">
          <div className="flex items-center gap-1 mb-0.5">
            <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${c.accent} flex items-center justify-center shrink-0`}>
              <Building2 className="w-3 h-3 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-[10px] font-bold truncate">{dept.name}</h4>
              <p className="text-[7px] text-muted-foreground font-mono">{dept.code}</p>
            </div>
          </div>
          <div className="space-y-0.5">
            {dept.manager && (
              <div className="text-[7px] text-muted-foreground truncate">
                مدیر: {dept.manager.firstName?.slice(0,5)} {dept.manager.lastName?.slice(0,5)}
              </div>
            )}
            <div className="flex items-center justify-between">
              <Badge className={`text-[6px] px-1 py-0 ${c.badge}`}>
                {getLevelLabel(dept.level)}
              </Badge>
              <span className="text-[7px]">{toPersianDigits(dept.employeeCount)} نفر</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* پست‌های سازمانی */}
      {hasPositions && (
        <div className="relative mt-2 w-full">
          <div className="absolute -top-2 left-1/2 w-px h-2 bg-gray-300 -translate-x-1/2" />
          
          <div className="relative pt-2">
            <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" />
            
            <div className="flex flex-row flex-wrap justify-center gap-2 px-1">
              {dept.positions.map(pos => (
                <div key={pos.id} className="relative flex flex-col items-center">
                  <div className="absolute -top-2 left-1/2 w-px h-2 bg-gray-300 -translate-x-1/2" />
                  
                  {/* کارت پست */}
                  <Card className="w-24 border border-amber-200 bg-amber-50">
                    <CardContent className="p-1 text-center">
                      <Briefcase className="w-2.5 h-2.5 mx-auto mb-0.5 text-amber-600" />
                      <p className="text-[7px] font-bold truncate">{pos.title}</p>
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <Badge variant="outline" className="text-[6px] px-1">
                          {toPersianDigits(pos.headcount)} نفر
                        </Badge>
                      </div>
                      {pos.appointments.length > 0 && (
                        <div className="text-[6px] text-muted-foreground mt-0.5">
                          {toPersianDigits(pos.appointments.length)} نفر
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* کارمندان */}
                  {pos.appointments.length > 0 && (
                    <div className="relative mt-1.5">
                      <div className="absolute -top-1.5 left-1/2 w-px h-1.5 bg-gray-300 -translate-x-1/2" />
                      <div className="relative pt-1.5">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" />
                        <div className="flex flex-row flex-wrap justify-center gap-1 px-0.5">
                          {pos.appointments.slice(0, 2).map(apt => (
                            <div key={apt.id} className="relative flex flex-col items-center">
                              <div className="absolute -top-1.5 left-1/2 w-px h-1.5 bg-gray-300 -translate-x-1/2" />
                              <Card className="w-20 border border-emerald-200 bg-white">
                                <CardContent className="p-0.5 text-center">
                                  <div className="w-4 h-4 mx-auto mb-0.5 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <User className="w-2 h-2 text-emerald-600" />
                                  </div>
                                  <p className="text-[6px] font-medium truncate">{apt.employee.firstName?.slice(0,6)}</p>
                                  <p className="text-[5px] text-muted-foreground">{apt.type === 'main' ? 'اصلی' : 'سرپرست'}</p>
                                </CardContent>
                              </Card>
                            </div>
                          ))}
                        </div>
                        {pos.appointments.length > 2 && (
                          <div className="text-center text-[6px] text-muted-foreground mt-0.5">
                            +{toPersianDigits(pos.appointments.length - 2)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
function DepartmentDetailCard({ dept, activeTab, onTabChange, allEmployees }: { 
  dept: DepartmentNode
  activeTab: string
  onTabChange: (tab: string) => void
  allEmployees?: EmployeeBasic[]
}) {
  const c = getLevelColor(dept.level)
  
  // کارمندان این دپارتمان را از appointments استخراج کن
  const deptEmployees: EmployeeBasic[] = []
  dept.positions.forEach(pos => {
    pos.appointments.forEach(apt => {
      if (!deptEmployees.some(e => e.id === apt.employee.id)) {
        deptEmployees.push(apt.employee)
      }
    })
  })

  const departmentInfo = {
    nameEn: dept.code || '—',
    description: 'این دپارتمان مسئول مدیریت و هماهنگی فعالیت‌های مرتبط با حوزه خود می‌باشد.',
    location: 'ساختمان مرکزی، طبقه ۳',
    email: `${dept.code?.toLowerCase()}@company.ir`,
    phone: '۰۲۱-۱۲۳۴۵۶۷۸',
    annualBudget: '۵,۰۰۰,۰۰۰,۰۰۰',
  }

  const tabs = [
    { id: 'info', label: 'اطلاعات کلی', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'employees', label: 'کارکنان', icon: <Users className="w-3.5 h-3.5" />, count: deptEmployees.length },
    { id: 'positions', label: 'پست‌ها', icon: <Briefcase className="w-3.5 h-3.5" />, count: dept.positions.length },
  ]

  return (  // ← این return مهم است
    <Card className="border-0 shadow-xl rounded-2xl overflow-hidden sticky top-4 bg-white dark:bg-gray-900">
      {/* هدر کارت با گرادیانت سبز */}
      <div className="p-5 bg-gradient-to-l from-emerald-600 to-teal-600">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{dept.name}</h3>
            <p className="text-xs text-white/80 font-mono">{dept.code}</p>
          </div>
        </div>
      </div>
      
      {/* تب‌ها */}
      <div className="px-5 pt-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 ${
                activeTab === tab.id 
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {toPersianDigits(tab.count)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <CardContent className="p-5 space-y-4 max-h-[550px] overflow-y-auto">
        {/* تب اطلاعات کلی */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800">
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mb-1">نام انگلیسی</p>
                <p className="text-sm font-medium font-mono text-gray-800 dark:text-gray-200" dir="ltr">{departmentInfo.nameEn}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800">
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mb-1">کد دپارتمان</p>
                <p className="text-sm font-medium font-mono text-gray-800 dark:text-gray-200" dir="ltr">{dept.code}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800">
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mb-1">مدیر واحد</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : '—'}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800">
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mb-1">سطح سازمانی</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{getLevelLabel(dept.level)}</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800">
                <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mb-1">مکان</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{departmentInfo.location}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border border-emerald-200 dark:border-emerald-800">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-1">تعداد پرسنل</p>
                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{toPersianDigits(dept.employeeCount)} نفر</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800">
              <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mb-1">ایمیل واحد</p>
              <p className="text-sm font-mono text-gray-800 dark:text-gray-200" dir="ltr">{departmentInfo.email}</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800">
              <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mb-1">تلفن مستقیم</p>
              <p className="text-sm font-mono text-gray-800 dark:text-gray-200" dir="ltr">{departmentInfo.phone}</p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/40 dark:to-teal-900/40 border border-emerald-200 dark:border-emerald-800">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mb-1">بودجه سالیانه</p>
              <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">{departmentInfo.annualBudget} ریال</p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800">
              <p className="text-[10px] text-emerald-500 dark:text-emerald-400 mb-1">توضیحات</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{departmentInfo.description}</p>
            </div>
          </div>
        )}

        {/* تب کارکنان */}
        {activeTab === 'employees' && (
          <div className="space-y-2 max-h-[450px] overflow-y-auto">
            {deptEmployees.length > 0 ? (
              deptEmployees.map(emp => (
                <div key={emp.id} className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-white">{emp.firstName[0]}{emp.lastName[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{emp.firstName} {emp.lastName}</p>
                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">{emp.personnelCode}</p>
                      </div>
                    </div>
                    <Badge className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                      {emp.position || 'کارشناس'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">کارمندی ثبت نشده است</p>
              </div>
            )}
          </div>
        )}

        {/* تب پست‌ها */}
        {activeTab === 'positions' && (
          <div className="space-y-3">
            {dept.positions.length > 0 ? (
              dept.positions.map(pos => (
                <div key={pos.id} className="p-3 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{pos.title}</span>
                    </div>
                    <Badge className={`text-[8px] px-2 py-0.5 rounded-full ${
                      pos.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' 
                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {pos.status === 'active' ? 'فعال' : 'غیرفعال'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-2 mr-10">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">تعداد مجاز:</span>
                      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{toPersianDigits(pos.headcount)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">مشغول:</span>
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{toPersianDigits(pos.occupiedCount)}</span>
                    </div>
                    {pos.availableCount > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">جای خالی:</span>
                        <span className="text-xs font-semibold text-amber-600">{toPersianDigits(pos.availableCount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">پست سازمانی تعریف نشده است</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}