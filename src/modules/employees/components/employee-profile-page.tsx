'use client'

import { useState, useEffect } from 'react'
import { EmployeeProfile } from './employee-profile'
import { Skeleton } from '@/core/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Card } from '@/core/components/ui/card'
import { AlertCircle, Search, Users } from 'lucide-react'
import { Input } from '@/core/components/ui/input'

interface EmployeeBasic {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  position: string | null
}

interface EmployeeProfilePageProps {
  onNavigate?: (id: string) => void
}

export function EmployeeProfilePage({ onNavigate }: EmployeeProfilePageProps) {
  const [employees, setEmployees] = useState<EmployeeBasic[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeBasic[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('')
  const [employee, setEmployee] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // گرفتن لیست کارمندان
  useEffect(() => {
    fetch('/api/employees?limit=100')
      .then(res => {
        if (!res.ok) throw new Error('خطا در دریافت لیست کارمندان')
        return res.json()
      })
      .then(data => {
        const items = Array.isArray(data) ? data : (data.data || [])
        setEmployees(items)
        setFilteredEmployees(items)
        if (items.length > 0) {
          setSelectedEmployeeId(items[0].id)
        } else {
          setError('هیچ کارمندی یافت نشد')
          setLoading(false)
        }
      })
      .catch(err => {
        console.error(err)
        setError(err.message || 'خطا در دریافت لیست کارمندان')
        setLoading(false)
      })
  }, [])

  // فیلتر کردن کارمندان بر اساس جستجو
  useEffect(() => {
    if (searchTerm) {
      const filtered = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.includes(searchTerm) ||
        emp.personnelCode.includes(searchTerm)
      )
      setFilteredEmployees(filtered)
    } else {
      setFilteredEmployees(employees)
    }
  }, [searchTerm, employees])

  // گرفتن اطلاعات کامل کارمند انتخاب شده
  // گرفتن اطلاعات کامل کارمند انتخاب شده
useEffect(() => {
    if (selectedEmployeeId) {
      setLoading(true)
      setError(null)
      fetch(`/api/employees/${selectedEmployeeId}`)
        .then(res => {
          if (!res.ok) throw new Error('خطا در دریافت اطلاعات کارمند')
          return res.json()
        })
        .then(data => {
          // اصلاح اینجا: اگر data.data وجود داشت ازش استفاده کن
          const employeeData = data.data || data
          const safeData = {
            ...employeeData,
            appointments: employeeData.appointments || [],
            contracts: employeeData.contracts || [],
            leaves: employeeData.leaves || [],
            attendance: employeeData.attendance || [],
            missions: employeeData.missions || [],
            paySlips: employeeData.paySlips || [],
            performances: employeeData.performances || [],
            rewards: employeeData.rewards || [],
            loanRequests: employeeData.loanRequests || [],
            trainings: employeeData.trainings || [],
            documents: employeeData.documents || [],
          }
          setEmployee(safeData)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setError(err.message || 'خطا در دریافت اطلاعات کارمند')
          setLoading(false)
        })
    }
  }, [selectedEmployeeId])

  const handleRefresh = () => {
    if (selectedEmployeeId) {
      setLoading(true)
      fetch(`/api/employees/${selectedEmployeeId}`)
        .then(res => res.json())
        .then(data => {
          const employeeData = data.data || data
          const safeData = {
            ...employeeData,
            appointments: employeeData.appointments || [],
            contracts: employeeData.contracts || [],
            leaves: employeeData.leaves || [],
            attendance: employeeData.attendance || [],
            missions: employeeData.missions || [],
            paySlips: employeeData.paySlips || [],
            performances: employeeData.performances || [],
            rewards: employeeData.rewards || [],
            loanRequests: employeeData.loanRequests || [],
            trainings: employeeData.trainings || [],
            documents: employeeData.documents || [],
          }
          setEmployee(safeData)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }
  }

  // نمایش خطا
  if (error && !employee) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-500" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  // نمایش لودینگ
  if (loading && !employee) {
    return (
      <div className="space-y-4" dir="rtl">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    )
  }

  // اگر لیست کارمندان خالی است
  if (employees.length === 0 && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" dir="rtl">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">هیچ کارمندی یافت نشد</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-6 h-6" />
          <h2 className="text-xl font-bold">پرونده پرسنلی</h2>
        </div>
        <p className="text-emerald-100 text-sm">
          مشاهده و ویرایش اطلاعات کامل پرسنلی کارکنان
        </p>
      </div>

      {/* Search and Select Card */}
      <Card className="p-4 border-0 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="جستجوی کارمند (نام، نام خانوادگی، کد پرسنلی)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9"
            />
          </div>
          <div className="w-full sm:w-80">
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب کارمند" />
              </SelectTrigger>
              <SelectContent>
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.personnelCode}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-muted-foreground">
                    کارمندی یافت نشد
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

    {/* نمایش پروفایل */}
{employee && (
  <div>
    <EmployeeProfile 
      employee={employee}
      onRefresh={handleRefresh}
      onNavigate={onNavigate}
    />
  </div>
)}
    </div>
  )
}