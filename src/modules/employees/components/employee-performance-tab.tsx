// src/modules/employees/components/employee-performance-tab.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BarChart3, Star, Target, CheckCircle2, Clock, AlertCircle,
  Loader2, Eye, User, Calendar, TrendingUp, TrendingDown
} from 'lucide-react';
import { Card, CardContent } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { Badge } from '@/core/components/ui/badge';
import { Separator } from '@/core/components/ui/separator';
import { Progress } from '@/core/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/core/components/ui/dialog';
import { toPersianDigits } from '@/core/lib/utils-fa';
import { STATUS_MAP, scoreColor } from '@/modules/performance/constants';

// ============================================
// Types
// ============================================

interface Performance {
  id: string;
  employeeId: string;
  period: string;
  score: number;
  target: number;
  kpi1: number | null;
  kpi2: number | null;
  kpi3: number | null;
  kpi4: number | null;
  comments: string | null;
  status: string;
  createdAt: string;
  employee?: {
    id: string;
    firstName: string;
    lastName: string;
    department: string | null;
    position: string | null;
  };
}

interface EmployeePerformanceTabProps {
  employeeId: string;
  employeeName?: string;
}

// ============================================
// Detail Dialog
// ============================================

function PerformanceDetailDialog({
  open,
  onClose,
  performance,
}: {
  open: boolean;
  onClose: () => void;
  performance: Performance | null;
}) {
  const [departmentName, setDepartmentName] = useState<string | null>(null);
  const [positionName, setPositionName] = useState<string | null>(null);

  // ✅ دریافت نام دپارتمان و سمت
  useEffect(() => {
    const fetchNames = async () => {
      if (!performance?.employee) return;

      // دریافت نام دپارتمان
      if (performance.employee.department && !performance.employee.department.startsWith('_')) {
        try {
          const res = await fetch(`/api/departments/${performance.employee.department}`);
          if (res.ok) {
            const data = await res.json();
            setDepartmentName(data.name || data.title || performance.employee.department);
          }
        } catch (e) {
          console.error('Error fetching department:', e);
        }
      }

      // دریافت نام سمت
      if (performance.employee.position && !performance.employee.position.startsWith('_')) {
        try {
          const res = await fetch(`/api/positions/${performance.employee.position}`);
          if (res.ok) {
            const data = await res.json();
            setPositionName(data.title || data.name || performance.employee.position);
          }
        } catch (e) {
          console.error('Error fetching position:', e);
        }
      }
    };
    fetchNames();
  }, [performance?.employee?.department, performance?.employee?.position]);

  if (!performance) return null;

  const statusInfo = STATUS_MAP[performance.status] || STATUS_MAP.pending;
  const StatusIcon = statusInfo.icon;
  const progressPct = Math.min((performance.score / 5) * 100, 100);
  const targetPct = Math.min((performance.target / 5) * 100, 100);
  const isMetTarget = performance.score >= performance.target;

  // محاسبه میانگین KPI ها
  const kpiValues = [performance.kpi1, performance.kpi2, performance.kpi3, performance.kpi4]
    .filter((v): v is number => v !== null && v > 0);
  const avgKpi = kpiValues.length > 0 
    ? +(kpiValues.reduce((s, v) => s + v, 0) / kpiValues.length).toFixed(2)
    : null;

  const displayDepartment = departmentName || performance.employee?.department || null;
  const displayPosition = positionName || performance.employee?.position || null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            جزئیات ارزیابی
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Employee Info با نام دپارتمان و سمت */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-500 flex items-center justify-center text-white font-bold text-sm">
              {performance.employee?.firstName?.[0] || '?'}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {performance.employee?.firstName} {performance.employee?.lastName}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {displayDepartment || 'بدون دپارتمان'}
                {displayPosition && ` • ${displayPosition}`}
              </p>
            </div>
          </div>

          <Separator />

          {/* Period & Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{performance.period}</span>
            </div>
            <Badge className={`text-[10px] ${statusInfo.color}`}>
              <StatusIcon className="w-3 h-3 ml-1" />
              {statusInfo.label}
            </Badge>
          </div>

          {/* Score */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className={`w-5 h-5 ${scoreColor(performance.score, performance.target)}`} />
                <span className={`text-2xl font-bold ${scoreColor(performance.score, performance.target)}`}>
                  {toPersianDigits(performance.score)}
                </span>
                <span className="text-sm text-muted-foreground">/ {toPersianDigits(performance.target)}</span>
              </div>
              <Badge className={`text-[10px] ${isMetTarget ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {isMetTarget ? 'تحقق هدف' : 'نیاز به بهبود'}
              </Badge>
            </div>
            <div className="mt-2 relative">
              <Progress value={progressPct} className="h-2" />
              {targetPct > 0 && (
                <div
                  className="absolute top-0 h-2 w-0.5 bg-amber-500"
                  style={{ left: `${targetPct}%` }}
                />
              )}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>نمره: {toPersianDigits(progressPct)}%</span>
              <span>هدف: {toPersianDigits(targetPct)}%</span>
            </div>
          </div>

          {/* KPIs */}
          {kpiValues.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-medium mb-2">شاخص‌های کلیدی (KPI)</p>
                <div className="grid grid-cols-2 gap-2">
                  {performance.kpi1 !== null && performance.kpi1 > 0 && (
                    <div className="p-2 rounded bg-muted/30 text-center">
                      <p className="text-[10px] text-muted-foreground">توانایی فنی</p>
                      <p className="text-sm font-bold text-purple-600">{toPersianDigits(performance.kpi1)}</p>
                    </div>
                  )}
                  {performance.kpi2 !== null && performance.kpi2 > 0 && (
                    <div className="p-2 rounded bg-muted/30 text-center">
                      <p className="text-[10px] text-muted-foreground">روابط انسانی</p>
                      <p className="text-sm font-bold text-blue-600">{toPersianDigits(performance.kpi2)}</p>
                    </div>
                  )}
                  {performance.kpi3 !== null && performance.kpi3 > 0 && (
                    <div className="p-2 rounded bg-muted/30 text-center">
                      <p className="text-[10px] text-muted-foreground">نوآوری</p>
                      <p className="text-sm font-bold text-emerald-600">{toPersianDigits(performance.kpi3)}</p>
                    </div>
                  )}
                  {performance.kpi4 !== null && performance.kpi4 > 0 && (
                    <div className="p-2 rounded bg-muted/30 text-center">
                      <p className="text-[10px] text-muted-foreground">رهبری</p>
                      <p className="text-sm font-bold text-amber-600">{toPersianDigits(performance.kpi4)}</p>
                    </div>
                  )}
                </div>
                {avgKpi !== null && (
                  <div className="mt-2 text-center text-[10px] text-muted-foreground">
                    میانگین KPI: <span className="font-medium text-purple-600">{toPersianDigits(avgKpi)}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {performance.comments && (
            <>
              <Separator />
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-[10px] text-muted-foreground mb-1">نظرات</p>
                <p className="text-sm">{performance.comments}</p>
              </div>
            </>
          )}

          <div className="text-[10px] text-muted-foreground text-left">
            تاریخ ثبت: {toPersianDigits(new Date(performance.createdAt).toLocaleDateString('fa-IR'))}
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

export function EmployeePerformanceTab({ employeeId, employeeName = '' }: EmployeePerformanceTabProps) {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // دریافت ارزیابی‌های کارمند
  const fetchPerformances = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/performance?employeeId=${employeeId}`);
      if (res.ok) {
        const result = await res.json();
        const items = Array.isArray(result) ? result : (result.data || []);
        setPerformances(items);
      }
    } catch (err) {
      console.error('Error fetching performances:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchPerformances();
  }, [fetchPerformances]);

  // آمار
  const stats = useMemo(() => {
    const total = performances.length;
    const completed = performances.filter(p => p.status === 'completed' || p.status === 'reviewed').length;
    const pending = performances.filter(p => p.status === 'pending').length;
    const metTarget = performances.filter(p => p.score >= p.target).length;
    const avgScore = total > 0 ? +(performances.reduce((s, p) => s + p.score, 0) / total).toFixed(1) : 0;
    const maxScore = total > 0 ? Math.max(...performances.map(p => p.score)) : 0;
    
    return { total, completed, pending, metTarget, avgScore, maxScore };
  }, [performances]);

  const openDetail = (performance: Performance) => {
    setSelectedPerformance(performance);
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
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600">
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">ارزیابی عملکرد</h4>
            <p className="text-[10px] text-muted-foreground">سوابق ارزیابی کارمند</p>
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
            <div className="text-lg font-bold text-purple-600">{toPersianDigits(stats.total)}</div>
            <div className="text-[10px] text-muted-foreground">کل ارزیابی‌ها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-emerald-600">{toPersianDigits(stats.completed)}</div>
            <div className="text-[10px] text-muted-foreground">تکمیل شده</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-amber-600">{toPersianDigits(stats.pending)}</div>
            <div className="text-[10px] text-muted-foreground">در انتظار</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-sky-600">{toPersianDigits(stats.metTarget)}</div>
            <div className="text-[10px] text-muted-foreground">تحقق هدف</div>
          </CardContent>
        </Card>
      </div>

      {/* Average Score Card */}
      {stats.total > 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-950/20 dark:to-fuchsia-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-muted-foreground">میانگین نمره</p>
                <p className="text-2xl font-bold text-purple-600">{toPersianDigits(stats.avgScore)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">بالاترین نمره</p>
                <p className="text-xl font-bold text-emerald-600">{toPersianDigits(stats.maxScore)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground">نرخ تحقق هدف</p>
                <p className="text-xl font-bold text-sky-600">
                  {toPersianDigits(stats.total > 0 ? Math.round((stats.metTarget / stats.total) * 100) : 0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performances List */}
      {performances.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-medium">ارزیابی ثبت نشده</p>
          <p className="text-[10px] mt-1">هیچ ارزیابی برای این کارمند ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-3">
          {performances.map(performance => {
            const statusInfo = STATUS_MAP[performance.status] || STATUS_MAP.pending;
            const StatusIcon = statusInfo.icon;
            const isMetTarget = performance.score >= performance.target;
            const progressPct = Math.min((performance.score / 5) * 100, 100);

            return (
              <div
                key={performance.id}
                className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                onClick={() => openDetail(performance)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold">{performance.period}</span>
                      <Badge className={`text-[10px] ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3 ml-1" />
                        {statusInfo.label}
                      </Badge>
                      <Badge className={`text-[10px] ${isMetTarget ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {isMetTarget ? (
                          <><CheckCircle2 className="w-3 h-3 ml-1" /> تحقق هدف</>
                        ) : (
                          <><AlertCircle className="w-3 h-3 ml-1" /> نیاز به بهبود</>
                        )}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className={`w-4 h-4 ${scoreColor(performance.score, performance.target)}`} />
                        <span className={`text-lg font-bold ${scoreColor(performance.score, performance.target)}`}>
                          {toPersianDigits(performance.score)}
                        </span>
                        <span className="text-xs text-muted-foreground">/ {toPersianDigits(performance.target)}</span>
                      </div>
                      <div className="flex-1 max-w-[100px]">
                        <Progress value={progressPct} className="h-1.5" />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {toPersianDigits(Math.round(progressPct))}%
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => { e.stopPropagation(); openDetail(performance); }}
                  >
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>

                {/* KPI Preview */}
                {[performance.kpi1, performance.kpi2, performance.kpi3, performance.kpi4].some(v => v !== null && v > 0) && (
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-purple-500" />
                      میانگین KPI:
                    </span>
                    {(() => {
                      const kpis = [performance.kpi1, performance.kpi2, performance.kpi3, performance.kpi4]
                        .filter((v): v is number => v !== null && v > 0);
                      if (kpis.length === 0) return null;
                      const avg = +(kpis.reduce((s, v) => s + v, 0) / kpis.length).toFixed(1);
                      return (
                        <span className="font-medium text-purple-600">{toPersianDigits(avg)}</span>
                      );
                    })()}
                  </div>
                )}

                {performance.comments && (
                  <p className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
                    {performance.comments}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <PerformanceDetailDialog
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedPerformance(null); }}
        performance={selectedPerformance}
      />
    </div>
  );
}