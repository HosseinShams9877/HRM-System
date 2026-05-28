'use client'

import {
  Building2, Calendar, Plus, Pencil, Trash2, Loader2,
  Repeat, Sun, Handshake, AlertCircle, Check, X, Lock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { Badge } from '@/core/components/ui/badge'
import { Switch } from '@/core/components/ui/switch'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/core/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/core/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/core/components/ui/alert-dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/core/components/ui/select'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { formatShamsi } from '@/core/lib/utils-fa'
import type { Department, Holiday, HolidayStats } from '../index'
import { HOLIDAY_TYPE_MAP, ROLES_DATA, DEPT_COLORS } from '../constants'

// ============================================
// Helper
// ============================================

function getTypeBadge(type: string) {
  const info = HOLIDAY_TYPE_MAP[type]
  if (!info) return null
  const Icon = info.icon
  return (
    <Badge variant="outline" className={`${info.bgClass} ${info.color} border gap-1 text-[11px]`}>
      <Icon className="w-3 h-3" />
      {info.label}
    </Badge>
  )
}

// ============================================
// Departments Section
// ============================================

interface DepartmentsSectionProps {
  departments: Department[]
  deptLoading: boolean
  deptDialogOpen: boolean
  editingDept: Department | null
  deptForm: { name: string; code: string }
  deptSaving: boolean
  deleteDeptDialog: Department | null
  onOpenAddDept: () => void
  onOpenEditDept: (dept: Department) => void
  onSetDeptDialogOpen: (open: boolean) => void
  onDeptFormChange: (form: { name: string; code: string }) => void
  onSaveDepartment: () => void
  onSetDeleteDeptDialog: (dept: Department | null) => void
  onConfirmDeleteDept: () => void
}

function DepartmentsSection({
  departments, deptLoading, deptDialogOpen, editingDept, deptForm, deptSaving, deleteDeptDialog,
  onOpenAddDept, onOpenEditDept, onSetDeptDialogOpen, onDeptFormChange, onSaveDepartment, onSetDeleteDeptDialog, onConfirmDeleteDept,
}: DepartmentsSectionProps) {
  const getDeptColor = (idx: number) => DEPT_COLORS[idx % DEPT_COLORS.length]

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                دپارتمان‌ها
              </CardTitle>
              <Badge variant="secondary" className="text-[10px]">
                {toPersianDigits(departments.length)}
              </Badge>
            </div>
            <Button size="sm" onClick={onOpenAddDept} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              افزودن دپارتمان
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {deptLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : departments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>دپارتمانی تعریف نشده</p>
              <p className="text-[10px] mt-1">با کلیک روی دکمه افزودن، دپارتمان جدید ایجاد کنید</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">نام</TableHead>
                  <TableHead className="text-xs">کد</TableHead>
                  <TableHead className="text-xs">مدیر</TableHead>
                  <TableHead className="text-xs">پست سازمانی</TableHead>
                  <TableHead className="text-xs text-left">اقدامات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept, idx) => (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${getDeptColor(idx)}`}>
                          {dept.name.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{dept.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[11px] font-mono">
                        {dept.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {dept.managerId ? 'تعیین شده' : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {dept.positions ? toPersianDigits(dept.positions.length) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => onOpenEditDept(dept)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                          onClick={() => onSetDeleteDeptDialog(dept)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Department Add/Edit Dialog */}
      <Dialog open={deptDialogOpen} onOpenChange={onSetDeptDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editingDept ? 'ویرایش دپارتمان' : 'افزودن دپارتمان جدید'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingDept ? 'اطلاعات دپارتمان را ویرایش کنید' : 'نام و کد دپارتمان جدید را وارد کنید'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block">نام دپارتمان *</label>
              <Input
                value={deptForm.name}
                onChange={e => onDeptFormChange({ ...deptForm, name: e.target.value })}
                className="text-xs"
                placeholder="مثال: منابع انسانی"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">کد دپارتمان *</label>
              <Input
                value={deptForm.code}
                onChange={e => onDeptFormChange({ ...deptForm, code: e.target.value })}
                className="text-xs"
                placeholder="مثال: HR"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => onSetDeptDialogOpen(false)} className="text-xs">
              انصراف
            </Button>
            <Button
              size="sm"
              onClick={onSaveDepartment}
              disabled={!deptForm.name || !deptForm.code || deptSaving}
              className="text-xs gap-1.5"
            >
              {deptSaving && <Loader2 className="w-3 h-3 animate-spin" />}
              {editingDept ? 'بروزرسانی' : 'افزودن'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Department Delete Confirmation */}
      <AlertDialog open={!!deleteDeptDialog} onOpenChange={(open) => !open && onSetDeleteDeptDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">حذف دپارتمان</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              آیا از حذف دپارتمان «{deleteDeptDialog?.name}» اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDeleteDept} className="text-xs bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

// ============================================
// Holidays Section
// ============================================

interface HolidaysSectionProps {
  holidays: Holiday[]
  holidayStats: HolidayStats
  holidayLoading: boolean
  holidayYearFilter: string
  holidayTypeFilter: string
  holidayDialogOpen: boolean
  editingHoliday: Holiday | null
  holidayForm: { title: string; date: string; type: string; isRecurring: boolean; description: string }
  holidaySaving: boolean
  deleteHolidayDialog: Holiday | null
  onSetHolidayYearFilter: (val: string) => void
  onSetHolidayTypeFilter: (val: string) => void
  onOpenAddHoliday: () => void
  onOpenEditHoliday: (h: Holiday) => void
  onSetHolidayDialogOpen: (open: boolean) => void
  onHolidayFormChange: (form: { title: string; date: string; type: string; isRecurring: boolean; description: string }) => void
  onSaveHoliday: () => void
  onSetDeleteHolidayDialog: (h: Holiday | null) => void
  onConfirmDeleteHoliday: () => void
}

function HolidaysSection({
  holidays, holidayStats, holidayLoading, holidayYearFilter, holidayTypeFilter,
  holidayDialogOpen, editingHoliday, holidayForm, holidaySaving, deleteHolidayDialog,
  onSetHolidayYearFilter, onSetHolidayTypeFilter, onOpenAddHoliday, onOpenEditHoliday, onSetHolidayDialogOpen,
  onHolidayFormChange, onSaveHoliday, onSetDeleteHolidayDialog, onConfirmDeleteHoliday,
}: HolidaysSectionProps) {
  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">کل تعطیلات</p>
                <p className="text-lg font-bold">{toPersianDigits(holidayStats.total)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Sun className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">رسمی</p>
                <p className="text-lg font-bold text-emerald-600">{toPersianDigits(holidayStats.official)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Handshake className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">توافقی</p>
                <p className="text-lg font-bold text-blue-600">{toPersianDigits(holidayStats.agreed)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">اتفاقی</p>
                <p className="text-lg font-bold text-amber-600">{toPersianDigits(holidayStats.occasional)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Add Button */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                value={holidayYearFilter}
                onChange={e => onSetHolidayYearFilter(e.target.value)}
                placeholder="سال شمسی (مثلاً 1404)"
                className="text-xs w-40"
              />
              <Select value={holidayTypeFilter} onValueChange={onSetHolidayTypeFilter}>
                <SelectTrigger className="text-xs w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">همه</SelectItem>
                  <SelectItem value="official" className="text-xs">رسمی</SelectItem>
                  <SelectItem value="agreed" className="text-xs">توافقی</SelectItem>
                  <SelectItem value="occasional" className="text-xs">اتفاقی</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={onOpenAddHoliday} className="gap-1.5 text-xs">
              <Plus className="w-3.5 h-3.5" />
              افزودن تعطیلی
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {holidayLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : holidays.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>تعطیلی ثبت نشده</p>
              <p className="text-[10px] mt-1">با کلیک روی دکمه افزودن، تعطیلی جدید ثبت کنید</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">عنوان</TableHead>
                    <TableHead className="text-xs">تاریخ</TableHead>
                    <TableHead className="text-xs">نوع</TableHead>
                    <TableHead className="text-xs">تکرار سالانه</TableHead>
                    <TableHead className="text-xs">توضیحات</TableHead>
                    <TableHead className="text-xs text-left">اقدامات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {holidays.map(holiday => (
                    <TableRow key={holiday.id}>
                      <TableCell className="text-sm font-medium">{holiday.title}</TableCell>
                      <TableCell className="text-xs">
                        {formatShamsi(holiday.date)}
                      </TableCell>
                      <TableCell>{getTypeBadge(holiday.type)}</TableCell>
                      <TableCell>
                        {holiday.isRecurring ? (
                          <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 gap-1 text-[11px]">
                            <Repeat className="w-3 h-3" />
                            بله
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">خیر</span>
                          )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                        {holiday.description || '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => onOpenEditHoliday(holiday)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                            onClick={() => onSetDeleteHolidayDialog(holiday)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Holiday Add/Edit Dialog */}
      <Dialog open={holidayDialogOpen} onOpenChange={onSetHolidayDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editingHoliday ? 'ویرایش تعطیلی' : 'افزودن تعطیلی جدید'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingHoliday ? 'اطلاعات تعطیلی را ویرایش کنید' : 'اطلاعات تعطیلی جدید را وارد کنید'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block">عنوان *</label>
              <Input
                value={holidayForm.title}
                onChange={e => onHolidayFormChange({ ...holidayForm, title: e.target.value })}
                className="text-xs"
                placeholder="مثال: عید نوروز"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">تاریخ (شمسی) *</label>
              <Input
                value={holidayForm.date}
                onChange={e => onHolidayFormChange({ ...holidayForm, date: e.target.value })}
                className="text-xs"
                placeholder="مثال: 1404/01/01"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">نوع *</label>
              <Select
                value={holidayForm.type}
                onValueChange={val => onHolidayFormChange({ ...holidayForm, type: val })}
              >
                <SelectTrigger className="text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="official" className="text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      رسمی
                    </span>
                  </SelectItem>
                  <SelectItem value="agreed" className="text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      توافقی
                    </span>
                  </SelectItem>
                  <SelectItem value="occasional" className="text-xs">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      اتفاقی
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-medium block">تکرار سالانه</label>
                <p className="text-[10px] text-muted-foreground">این تعطیلی هر سال تکرار می‌شود</p>
              </div>
              <Switch
                checked={holidayForm.isRecurring}
                onCheckedChange={checked => onHolidayFormChange({ ...holidayForm, isRecurring: checked })}
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">توضیحات</label>
              <Textarea
                value={holidayForm.description}
                onChange={e => onHolidayFormChange({ ...holidayForm, description: e.target.value })}
                className="text-xs min-h-16"
                placeholder="توضیحات اختیاری..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => onSetHolidayDialogOpen(false)} className="text-xs">
              انصراف
            </Button>
            <Button
              size="sm"
              onClick={onSaveHoliday}
              disabled={!holidayForm.title || !holidayForm.date || !holidayForm.type || holidaySaving}
              className="text-xs gap-1.5"
            >
              {holidaySaving && <Loader2 className="w-3 h-3 animate-spin" />}
              {editingHoliday ? 'بروزرسانی' : 'افزودن'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Holiday Delete Confirmation */}
      <AlertDialog open={!!deleteHolidayDialog} onOpenChange={(open) => !open && onSetDeleteHolidayDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">حذف تعطیلی</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              آیا از حذف تعطیلی «{deleteHolidayDialog?.title}» اطمینان دارید؟ این عمل قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-xs">انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDeleteHoliday} className="text-xs bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// Roles Section
// ============================================

function RolesSection() {
  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <Card className="border-0 shadow-sm bg-muted/30">
        <CardContent className="p-4 flex items-start gap-3">
          <Lock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">نقش‌ها و سطوح دسترسی</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              این بخش نمای کلی سطوح دسترسی نقش‌های مختلف را نمایش می‌دهد. ویرایش نقش‌ها در نسخه‌های آتی فعال خواهد شد.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Roles Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ROLES_DATA.map(role => {
          const RoleIcon = role.icon
          const accessCount = Object.values(role.modules).filter(Boolean).length
          const totalModules = Object.keys(role.modules).length
          return (
            <Card key={role.id} className="border-0 shadow-sm overflow-hidden">
              {/* Role Header */}
              <div className={`bg-gradient-to-l ${role.color} p-4`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20">
                    <RoleIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{role.title}</p>
                    <p className="text-[10px] text-white/70">{role.titleEn}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white/80 transition-all"
                      style={{ width: `${(accessCount / totalModules) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-white/80">
                    {toPersianDigits(accessCount)}/{toPersianDigits(totalModules)}
                  </span>
                </div>
              </div>

              {/* Module Access Grid */}
              <CardContent className="p-4">
                <div className="space-y-2">
                  {Object.entries(role.modules).map(([mod, hasAccess]) => (
                    <div key={mod} className="flex items-center justify-between py-1">
                      <span className="text-xs">{mod}</span>
                      {hasAccess ? (
                        <div className="flex items-center gap-1 text-emerald-600">
                          <Check className="w-3.5 h-3.5" />
                          <span className="text-[10px]">دسترسی</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400">
                          <X className="w-3.5 h-3.5" />
                          <span className="text-[10px]">بدون دسترسی</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Payroll Settings Tab — Unified Export
// ============================================

export type PayrollSection = 'departments' | 'holidays' | 'roles'

interface PayrollSettingsTabProps {
  section: PayrollSection
  // Departments props
  departments: Department[]
  deptLoading: boolean
  deptDialogOpen: boolean
  editingDept: Department | null
  deptForm: { name: string; code: string }
  deptSaving: boolean
  deleteDeptDialog: Department | null
  onOpenAddDept: () => void
  onOpenEditDept: (dept: Department) => void
  onSetDeptDialogOpen: (open: boolean) => void
  onDeptFormChange: (form: { name: string; code: string }) => void
  onSaveDepartment: () => void
  onSetDeleteDeptDialog: (dept: Department | null) => void
  onConfirmDeleteDept: () => void
  // Holidays props
  holidays: Holiday[]
  holidayStats: HolidayStats
  holidayLoading: boolean
  holidayYearFilter: string
  holidayTypeFilter: string
  holidayDialogOpen: boolean
  editingHoliday: Holiday | null
  holidayForm: { title: string; date: string; type: string; isRecurring: boolean; description: string }
  holidaySaving: boolean
  deleteHolidayDialog: Holiday | null
  onSetHolidayYearFilter: (val: string) => void
  onSetHolidayTypeFilter: (val: string) => void
  onOpenAddHoliday: () => void
  onOpenEditHoliday: (h: Holiday) => void
  onSetHolidayDialogOpen: (open: boolean) => void
  onHolidayFormChange: (form: { title: string; date: string; type: string; isRecurring: boolean; description: string }) => void
  onSaveHoliday: () => void
  onSetDeleteHolidayDialog: (h: Holiday | null) => void
  onConfirmDeleteHoliday: () => void
}

export function PayrollSettingsTab({ section, ...props }: PayrollSettingsTabProps) {
  switch (section) {
    case 'departments':
      return <DepartmentsSection {...props} />
    case 'holidays':
      return <HolidaysSection {...props} />
    case 'roles':
      return <RolesSection />
  }
}
