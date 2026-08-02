// src/modules/employees/components/employee-attendance-tab.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock, LogIn, LogOut, Calendar, CheckCircle2, XCircle,
  Loader2, Eye, User, AlertCircle, MapPin
} from 'lucide-react';
import { Card, CardContent } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { Separator } from '@/core/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/core/components/ui/dialog';
import { formatShamsi, toPersianDigits } from '@/core/lib/utils-fa';
import { STATUS_CONFIG } from '@/modules/attendance/attendance/constants';
import moment from 'moment-jalaali';

// ============================================
// توابع تبدیل تاریخ (مثل AttendanceModule)
// ============================================

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
};

const toEnglishNumber = (str: string): string => {
  const map: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  };
  return str.replace(/[۰-۹]/g, (d) => map[d] || d);
};

// تبدیل تاریخ شمسی به میلادی (Date)
const toMiladi = (shamsiDate: string): Date | null => {
  if (!shamsiDate) return null;
  try {
    const englishDate = toEnglishNumber(shamsiDate);
    const parts = englishDate.split('/').map(Number);
    if (parts.length !== 3) return null;
    const m = moment(`${parts[0]}/${parts[1]}/${parts[2]}`, 'jYYYY/jMM/jDD');
    if (!m.isValid()) return null;
    return m.toDate();
  } catch {
    return null;
  }
};

// ✅ تبدیل تاریخ میلادی به شمسی (برای نمایش)
const toShamsi = (date: Date | string): string => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '';
    const m = moment(d);
    const shamsiStr = m.format('jYYYY/jMM/jDD');
    return toPersianNumber(shamsiStr);
  } catch {
    return '';
  }
};

// ✅ تبدیل تاریخ میلادی به شمسی با فرمت کامل برای نمایش
const formatShamsiDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '—';
    const shamsi = toShamsi(date);
    if (!shamsi) return '—';
    return shamsi;
  } catch {
    return '—';
  }
};

// ============================================
// Types
// ============================================

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  workHours: number | null;
  overtime: number | null;
  createdAt: string;
  updatedAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    personnelCode: string;
    department: string | null;
    position: string | null;
  };
}

interface EmployeeAttendanceTabProps {
  employeeId: string;
  employeeName?: string;
}

// ============================================
// Status Badge
// ============================================

function AttendanceStatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.present;
  const Icon = c.icon;
  return (
    <Badge className={`text-[10px] gap-1 ${c.badgeClass}`}>
      <Icon className="w-3 h-3" />
      {c.label}
    </Badge>
  );
}

// ============================================
// Detail Dialog
// ============================================

function AttendanceDetailDialog({
  open,
  onClose,
  record,
}: {
  open: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
}) {
  if (!record) return null;

  const statusConfig = STATUS_CONFIG[record.status] || STATUS_CONFIG.present;
  const StatusIcon = statusConfig.icon;

  const calculateWorkTime = () => {
    if (!record.checkIn || !record.checkOut) return null;
    const [h1, m1] = record.checkIn.split(':').map(Number);
    const [h2, m2] = record.checkOut.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return { hours, minutes, total: diff };
  };

  const workTime = calculateWorkTime();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            جزئیات تردد
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {formatShamsi(record.date)}
              </span>
            </div>
            <AttendanceStatusBadge status={record.status} />
          </div>

          {record.employee && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                {record.employee.firstName?.[0] || '?'}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {record.employee.firstName} {record.employee.lastName}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  کد پرسنلی: {toPersianDigits(record.employee.personnelCode)}
                  {record.employee.department && ` • ${record.employee.department}`}
                </p>
              </div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground justify-center">
                <LogIn className="w-3.5 h-3.5 text-emerald-500" />
                ورود
              </div>
              <p className="text-lg font-bold text-emerald-600 mt-0.5" dir="ltr">
                {record.checkIn ? toPersianDigits(record.checkIn) : '—'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/20 text-center">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground justify-center">
                <LogOut className="w-3.5 h-3.5 text-sky-500" />
                خروج
              </div>
              <p className="text-lg font-bold text-sky-600 mt-0.5" dir="ltr">
                {record.checkOut ? toPersianDigits(record.checkOut) : '—'}
              </p>
            </div>
          </div>

          {workTime && (
            <>
              <Separator />
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
                  <p className="text-[10px] text-muted-foreground">کارکرد</p>
                  <p className="text-sm font-bold text-purple-600">
                    {toPersianDigits(workTime.hours)}:{toPersianDigits(String(workTime.minutes).padStart(2, '0'))}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-center">
                  <p className="text-[10px] text-muted-foreground">اضافه‌کاری</p>
                  <p className="text-sm font-bold text-amber-600">
                    {record.overtime !== null && record.overtime > 0 ? (
                      toPersianDigits(record.overtime.toFixed(1)) + ' ساعت'
                    ) : (
                      '—'
                    )}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
                  <p className="text-[10px] text-muted-foreground">وضعیت</p>
                  <div className="flex justify-center mt-0.5">
                    <AttendanceStatusBadge status={record.status} />
                  </div>
                </div>
              </div>
            </>
          )}

          <div className="text-[10px] text-muted-foreground text-left">
            تاریخ ثبت: {formatShamsiDate(record.createdAt)}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>بستن</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// Main Component
// ============================================

export function EmployeeAttendanceTab({ employeeId, employeeName = '' }: EmployeeAttendanceTabProps) {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // دریافت ترددها - فیلتر در فرانت
  const fetchAttendance = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      
      // دریافت همه ترددها (بدون فیلتر employeeId چون API قبول نمیکنه)
      const res = await fetch(`/api/attendance`);
      
      if (res.ok) {
        const result = await res.json();
        const data = result.data || result;
        const allRecords = Array.isArray(data) ? data : (data.records || []);
        
        // فیلتر کردن در فرانت بر اساس employeeId
        const filtered = allRecords.filter((r: AttendanceRecord) => r.employeeId === employeeId);
        
        // ✅ دریافت نام دپارتمان و سمت
        const enrichedRecords = await Promise.all(
          filtered.map(async (record: AttendanceRecord) => {
            let departmentName = record.employee?.department || '—';
            let positionName = record.employee?.position || '—';
            
            if (record.employee?.department && !record.employee.department.startsWith('_')) {
              try {
                const deptRes = await fetch(`/api/departments/${record.employee.department}`);
                if (deptRes.ok) {
                  const deptData = await deptRes.json();
                  departmentName = deptData.name || deptData.title || record.employee.department;
                }
              } catch (e) {
                console.error('Error fetching department:', e);
              }
            }
            
            if (record.employee?.position && !record.employee.position.startsWith('_')) {
              try {
                const posRes = await fetch(`/api/positions/${record.employee.position}`);
                if (posRes.ok) {
                  const posData = await posRes.json();
                  positionName = posData.title || posData.name || record.employee.position;
                }
              } catch (e) {
                console.error('Error fetching position:', e);
              }
            }
            
            return {
              ...record,
              employee: {
                ...record.employee,
                department: departmentName,
                position: positionName,
              }
            };
          })
        );
        
        console.log(`📊 [Attendance] کل ترددها: ${allRecords.length}, ترددهای کارمند: ${enrichedRecords.length}`);
        
        setRecords(enrichedRecords);
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // آمار
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const leave = records.filter(r => r.status === 'leave').length;
    const mission = records.filter(r => r.status === 'mission').length;
    const late = records.filter(r => r.status === 'late').length;
    
    const totalWorkHours = records.reduce((sum, r) => sum + (r.workHours || 0), 0);
    const totalOvertime = records.reduce((sum, r) => sum + (r.overtime || 0), 0);
    
    return { total, present, absent, leave, mission, late, totalWorkHours, totalOvertime };
  }, [records]);

  // مرتب‌سازی بر اساس تاریخ (جدیدترین اول)
  const sortedRecords = [...records].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const openDetail = (record: AttendanceRecord) => {
    setSelectedRecord(record);
    setDetailOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir='rtl'>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">تردد</h4>
            <p className="text-[10px] text-muted-foreground">سوابق ورود و خروج کارمند</p>
          </div>
        </div>
        {employeeName && (
          <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-medium">{employeeName}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-emerald-600">{toPersianDigits(stats.total)}</div>
            <div className="text-[10px] text-muted-foreground">کل ترددها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-green-600">{toPersianDigits(stats.present)}</div>
            <div className="text-[10px] text-muted-foreground">حاضر</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-amber-600">{toPersianDigits(stats.late)}</div>
            <div className="text-[10px] text-muted-foreground">تاخیر</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-rose-600">{toPersianDigits(stats.absent)}</div>
            <div className="text-[10px] text-muted-foreground">غیبت</div>
          </CardContent>
        </Card>
      </div>

      {/* Work Summary */}
      {stats.total > 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-950/20 dark:to-emerald-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground">مجموع کارکرد</p>
                  <p className="text-lg font-bold text-purple-600">
                    {toPersianDigits(stats.totalWorkHours.toFixed(1))} ساعت
                  </p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <p className="text-[10px] text-muted-foreground">اضافه‌کاری</p>
                  <p className="text-lg font-bold text-amber-600">
                    {toPersianDigits(stats.totalOvertime.toFixed(1))} ساعت
                  </p>
                </div>
                <Separator orientation="vertical" className="h-8" />
                <div>
                  <p className="text-[10px] text-muted-foreground">میانگین کارکرد روزانه</p>
                  <p className="text-lg font-bold text-emerald-600">
                    {toPersianDigits((stats.totalWorkHours / stats.total).toFixed(1))} ساعت
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  <CheckCircle2 className="w-3 h-3 ml-1 text-emerald-500" />
                  {toPersianDigits(Math.round((stats.present / stats.total) * 100))}% حضور
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Records List - با تاریخ شمسی */}
      {records.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-medium">ترددی ثبت نشده</p>
          <p className="text-[10px] mt-1">هیچ ورود و خروجی برای این کارمند ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedRecords.slice(0, 10).map(record => {
            const statusConfig = STATUS_CONFIG[record.status] || STATUS_CONFIG.present;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={record.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800"
                onClick={() => openDetail(record)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${statusConfig.bgClass} flex items-center justify-center`}>
                    <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.textClass}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        {formatShamsi(record.date)}
                      </span>
                      <AttendanceStatusBadge status={record.status} />
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                      {record.checkIn && (
                        <span className="flex items-center gap-1">
                          <LogIn className="w-3 h-3 text-emerald-500" />
                          {toPersianDigits(record.checkIn)}
                        </span>
                      )}
                      {record.checkOut && (
                        <span className="flex items-center gap-1">
                          <LogOut className="w-3 h-3 text-sky-500" />
                          {toPersianDigits(record.checkOut)}
                        </span>
                      )}
                      {record.workHours !== null && record.workHours > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-purple-500" />
                          {toPersianDigits(record.workHours.toFixed(1))} ساعت
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={(e) => { e.stopPropagation(); openDetail(record); }}
                >
                  <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            );
          })}
          {records.length > 10 && (
            <p className="text-center text-[10px] text-muted-foreground">
              و {toPersianDigits(records.length - 10)} مورد دیگر
            </p>
          )}
        </div>
      )}

      {/* Detail Dialog */}
      <AttendanceDetailDialog
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedRecord(null); }}
        record={selectedRecord}
      />
    </div>
  );
}