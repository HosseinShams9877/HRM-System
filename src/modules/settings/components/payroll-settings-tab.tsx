// src/modules/settings/components/payroll-settings-tab.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Building2, Calendar, Plus, Pencil, Trash2, Loader2,
  Repeat, Sun, Handshake, AlertCircle, Check, X, Lock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';
import { Textarea } from '@/core/components/ui/textarea';
import { Badge } from '@/core/components/ui/badge';
import { Switch } from '@/core/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/core/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/core/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/core/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/core/components/ui/select';
import { toPersianDigits } from '@/core/lib/utils-fa';
import { formatShamsi } from '@/core/lib/utils-fa';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HolidaysList } from '@/modules/shifts/components/holidays-list';
import { HolidayFormDialog } from '@/modules/shifts/components/holiday-form-dialog';
import type { Department, Holiday, HolidayStats } from '../index';
import { HOLIDAY_TYPE_MAP, ROLES_DATA, DEPT_COLORS } from '../constants';
import { toast } from 'sonner';

// ============================================
// Helper
// ============================================

function getTypeBadge(type: string) {
  const info = HOLIDAY_TYPE_MAP[type];
  if (!info) return null;
  const Icon = info.icon;
  return (
    <Badge variant="outline" className={`${info.bgClass} ${info.color} border gap-1 text-[11px]`}>
      <Icon className="w-3 h-3" />
      {info.label}
    </Badge>
  );
}

// ============================================
// Departments Section (همون قبلی)
// ============================================

interface DepartmentsSectionProps {
  departments: Department[];
  deptLoading: boolean;
  deptDialogOpen: boolean;
  editingDept: Department | null;
  deptForm: { name: string; code: string; managerId: string; parentId: string };
  deptSaving: boolean;
  deleteDeptDialog: Department | null;
  employees: { id: string; firstName: string; lastName: string; personnelCode: string }[];
  onOpenAddDept: () => void;
  onOpenEditDept: (dept: Department) => void;
  onSetDeptDialogOpen: (open: boolean) => void;
  onDeptFormChange: (form: { name: string; code: string; managerId: string; parentId: string }) => void;
  onSaveDepartment: () => void;
  onSetDeleteDeptDialog: (dept: Department | null) => void;
  onConfirmDeleteDept: () => void;
}

export function DepartmentsSection({
  departments,
  deptLoading,
  deptDialogOpen,
  editingDept,
  deptForm,
  deptSaving,
  deleteDeptDialog,
  employees,
  onOpenAddDept,
  onOpenEditDept,
  onSetDeptDialogOpen,
  onDeptFormChange,
  onSaveDepartment,
  onSetDeleteDeptDialog,
  onConfirmDeleteDept,
}: DepartmentsSectionProps) {
  const getDeptColor = (idx: number) => DEPT_COLORS[idx % DEPT_COLORS.length];

  const getManagerName = (managerId: string | null) => {
    if (!managerId) return '—';
    const manager = employees.find(emp => emp.id === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : 'تعیین شده';
  };

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
                  <TableHead className="text-xs">دپارتمان والد</TableHead>
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
                    <TableCell className="text-xs">
                      {getManagerName(dept.managerId)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {dept.parent?.name || '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {dept.positions ? toPersianDigits(dept.positions.length) : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                          onClick={() => onOpenEditDept(dept)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
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

      <Dialog open={deptDialogOpen} onOpenChange={onSetDeptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">
              {editingDept ? 'ویرایش دپارتمان' : 'افزودن دپارتمان جدید'}
            </DialogTitle>
            <DialogDescription className="text-xs">
              {editingDept ? 'اطلاعات دپارتمان را ویرایش کنید' : 'اطلاعات دپارتمان جدید را وارد کنید'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
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
                dir="ltr"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">مدیر دپارتمان</label>
              <Select
                value={deptForm.managerId || 'none'}
                onValueChange={(v) => onDeptFormChange({ ...deptForm, managerId: v === 'none' ? '' : v })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="انتخاب مدیر..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="sticky top-0 bg-white dark:bg-gray-950 p-2 border-b z-10">
                    <Input
                      placeholder="جستجوی کارمند..."
                      className="text-xs h-8"
                      onChange={(e) => {
                        const searchTerm = e.target.value.toLowerCase();
                        const items = document.querySelectorAll('.employee-select-item');
                        items.forEach(item => {
                          const text = item.textContent?.toLowerCase() || '';
                          if (text.includes(searchTerm)) {
                            (item as HTMLElement).style.display = 'flex';
                          } else {
                            (item as HTMLElement).style.display = 'none';
                          }
                        });
                      }}
                    />
                  </div>
                  <SelectItem value="none">بدون مدیر</SelectItem>
                  {employees && employees.length > 0 ? (
                    employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id} className="employee-select-item">
                        {emp.firstName} {emp.lastName} ({emp.personnelCode})
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>کارمندی یافت نشد</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">دپارتمان والد</label>
              <Select
                value={deptForm.parentId || 'none'}
                onValueChange={(v) => onDeptFormChange({ ...deptForm, parentId: v === 'none' ? '' : v })}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="انتخاب دپارتمان والد..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">بدون والد (ریشه)</SelectItem>
                  {departments.filter(d => d.id !== editingDept?.id).map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
  );
}

// ============================================
// Holidays Section - با لاگ کامل
// ============================================

interface HolidaysSectionProps {
  holidayTypeFilter: string;
  holidayDialogOpen: boolean;
  editingHoliday: Holiday | null;
  holidayForm: { title: string; date: string; type: string; isRecurring: boolean; description: string };
  holidaySaving: boolean;
  deleteHolidayDialog: Holiday | null;
  onSetHolidayTypeFilter: (val: string) => void;
  onOpenAddHoliday: () => void;
  onOpenEditHoliday: (h: Holiday) => void;
  onSetHolidayDialogOpen: (open: boolean) => void;
  onHolidayFormChange: (form: { title: string; date: string; type: string; isRecurring: boolean; description: string }) => void;
  onSaveHoliday: () => void;
  onSetDeleteHolidayDialog: (h: Holiday | null) => void;
  onConfirmDeleteHoliday: () => void;
}

// src/modules/settings/components/payroll-settings-tab.tsx

// ============================================
// Holidays Section - با لاگ کامل و fetch اجباری
// ============================================

// ============================================
// Holidays Section - با refetch داخلی
// ============================================

function HolidaysSection({
  holidayTypeFilter,
  holidayDialogOpen,
  editingHoliday,
  holidayForm,
  holidaySaving,
  deleteHolidayDialog,
  onSetHolidayTypeFilter,
  onOpenAddHoliday,
  onOpenEditHoliday,
  onSetHolidayDialogOpen,
  onHolidayFormChange,
  onSaveHoliday,
  onSetDeleteHolidayDialog,
  onConfirmDeleteHoliday,
}: HolidaysSectionProps) {
  

  // ✅ دریافت تعطیلات
  const { 
    data: holidays = [], 
    isLoading: holidayLoading,
    error: holidayError,
    refetch: refetchHolidays,
    status: holidayStatus,
  } = useQuery({
    queryKey: ['holidays'],
    queryFn: async () => {
 
      try {
        const res = await fetch(`/api/holidays`);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.log('🔄 [Holidays] ❌ خطا:', errorText);
          throw new Error(`خطا در دریافت تعطیلات: ${res.status}`);
        }
        
        const json = await res.json();
       
        return json.data || json || [];
      } catch (error) {
        console.error('🔄 [Holidays] ❌ خطای fetch:', error);
        return [];
      }
    },
    initialData: [],
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  

  // ✅ فیلتر بر اساس نوع
  const filteredHolidays = useMemo(() => {
    if (holidayTypeFilter === 'all') return holidays;
    return holidays.filter((h: any) => h.type === holidayTypeFilter);
  }, [holidays, holidayTypeFilter]);

 

  // ✅ آمار تعطیلات
  const holidayStats = useMemo(() => {
    const total = holidays.length;
    const official = holidays.filter((h: any) => h.type === 'official').length;
    const agreed = holidays.filter((h: any) => h.type === 'agreed').length;
    const occasional = holidays.filter((h: any) => h.type === 'occasional').length;
    console.log('📊 [Holidays] آمار:', { total, official, agreed, occasional });
    return { total, official, agreed, occasional };
  }, [holidays]);

  console.log('🎯 [Holidays] شرط نمایش:');
  console.log('🎯 [Holidays] holidayLoading:', holidayLoading);
  console.log('🎯 [Holidays] filteredHolidays.length === 0:', filteredHolidays.length === 0);
  console.log('🎯 [Holidays] باید HolidaysList رندر بشه؟', !holidayLoading && filteredHolidays.length > 0);

  return (
    <div className="space-y-4" dir='rtl'>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" dir='ltr'>
            <div className="flex items-center gap-2 flex-wrap">
              <Select value={holidayTypeFilter} onValueChange={onSetHolidayTypeFilter}>
                <SelectTrigger className="text-xs w-36">
                  <SelectValue placeholder="نوع تعطیلی" />
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
          ) : holidayError ? (
            <div className="text-center py-12 text-red-500 text-xs">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>خطا در دریافت تعطیلات</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => refetchHolidays()}>
                تلاش مجدد
              </Button>
            </div>
          ) : filteredHolidays.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>تعطیلی ثبت نشده</p>
              <p className="text-[10px] mt-1">با کلیک روی دکمه افزودن، تعطیلی جدید ثبت کنید</p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-emerald-600 mb-2">✅ {filteredHolidays.length} تعطیلی یافت شد</p>
              <HolidaysList
                holidays={filteredHolidays}
                onEdit={onOpenEditHoliday}
                onDelete={(id) => {
                  const holiday = holidays.find((h: any) => h.id === id);
                  if (holiday) onSetDeleteHolidayDialog(holiday);
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Holiday Form Dialog */}
      <HolidayFormDialog
        open={holidayDialogOpen}
        onClose={() => onSetHolidayDialogOpen(false)}
        onSubmit={onSaveHoliday}
        initialData={editingHoliday}
      />

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
  );
}

// ============================================
// Roles Section
// ============================================

function RolesSection() {
  return (
    <div className="space-y-4">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {ROLES_DATA.map(role => {
          const RoleIcon = role.icon;
          const accessCount = Object.values(role.modules).filter(Boolean).length;
          const totalModules = Object.keys(role.modules).length;
          return (
            <Card key={role.id} className="border-0 shadow-sm overflow-hidden">
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
          );
        })}
      </div>
    </div>
  );
}

// ============================================
// Payroll Settings Tab — Unified Export
// ============================================

export type PayrollSection = 'departments' | 'holidays' | 'roles';

interface PayrollSettingsTabProps {
  section: PayrollSection;
  departments: Department[];
  deptLoading: boolean;
  deptDialogOpen: boolean;
  editingDept: Department | null;
  deptForm: { name: string; code: string; managerId: string; parentId: string };
  deptSaving: boolean;
  deleteDeptDialog: Department | null;
  employees: { id: string; firstName: string; lastName: string; personnelCode: string }[];
  onOpenAddDept: () => void;
  onOpenEditDept: (dept: Department) => void;
  onSetDeptDialogOpen: (open: boolean) => void;
  onDeptFormChange: (form: { name: string; code: string; managerId: string; parentId: string }) => void;
  onSaveDepartment: () => void;
  onSetDeleteDeptDialog: (dept: Department | null) => void;
  onConfirmDeleteDept: () => void;
  holidayTypeFilter: string;
  holidayDialogOpen: boolean;
  editingHoliday: Holiday | null;
  holidayForm: { title: string; date: string; type: string; isRecurring: boolean; description: string };
  holidaySaving: boolean;
  deleteHolidayDialog: Holiday | null;
  onSetHolidayTypeFilter: (val: string) => void;
  onOpenAddHoliday: () => void;
  onOpenEditHoliday: (h: Holiday) => void;
  onSetHolidayDialogOpen: (open: boolean) => void;
  onHolidayFormChange: (form: { title: string; date: string; type: string; isRecurring: boolean; description: string }) => void;
  onSaveHoliday: () => void;
  onSetDeleteHolidayDialog: (h: Holiday | null) => void;
  onConfirmDeleteHoliday: () => void;
}

export function PayrollSettingsTab({ section, ...props }: PayrollSettingsTabProps) {
  switch (section) {
    case 'departments':
      return <DepartmentsSection {...props} />;
    case 'holidays':
      return <HolidaysSection {...props} />;
    case 'roles':
      return <RolesSection />;
    default:
      return null;
  }
}