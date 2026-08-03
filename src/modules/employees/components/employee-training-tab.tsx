// src/modules/employees/components/employee-training-tab.tsx

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GraduationCap, Calendar, Clock, Award, BookOpen,
  Loader2, Eye, User, MapPin, CheckCircle2, XCircle, AlertCircle
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
import { formatShamsi, toPersianDigits } from '@/core/lib/utils-fa';
import { STATUS_MAP, CATEGORY_MAP, PARTICIPANT_STATUS_MAP } from '@/modules/training/constants';

// ============================================
// Types
// ============================================

interface TrainingParticipant {
  id: string;
  status: string;
  score: number | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    personnelCode: string;
    department: string | null;
    position: string | null;
  };
}

interface Training {
  id: string;
  title: string;
  instructor: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  status: string;
  description: string | null;
  capacity: number | null;
  category: string | null;
  duration: number | null;
  maxScore: number | null;
  participants: TrainingParticipant[];
  createdAt: string;
}

interface EmployeeTrainingTabProps {
  employeeId: string;
  employeeName?: string;
}

// ============================================
// Detail Dialog
// ============================================

function TrainingDetailDialog({
  open,
  onClose,
  training,
}: {
  open: boolean;
  onClose: () => void;
  training: Training | null;
}) {
  if (!training) return null;

  const statusConfig = STATUS_MAP[training.status] || STATUS_MAP.planned;
  const categoryConfig = CATEGORY_MAP[training.category || ''] || { label: 'عمومی', color: 'bg-gray-100 text-gray-700' };

  const participantStatusCounts = {
    registered: training.participants.filter(p => p.status === 'registered').length,
    attending: training.participants.filter(p => p.status === 'attending').length,
    completed: training.participants.filter(p => p.status === 'completed').length,
    absent: training.participants.filter(p => p.status === 'absent').length,
  };

  const totalParticipants = training.participants.length;
  const completedParticipants = training.participants.filter(p => p.status === 'completed').length;
  const progress = training.capacity ? Math.round((totalParticipants / training.capacity) * 100) : 0;
  const completionRate = totalParticipants > 0 ? Math.round((completedParticipants / totalParticipants) * 100) : 0;

  // محاسبه میانگین نمرات
  const scores = training.participants
    .filter(p => p.score !== null && p.score !== undefined && p.score >= 0)
    .map(p => p.score as number);
  const avgScore = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            {training.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status & Category */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`text-[10px] ${statusConfig.color}`}>{statusConfig.label}</Badge>
            <Badge className={`text-[10px] ${categoryConfig.color}`}>{categoryConfig.label}</Badge>
            {training.duration && (
              <Badge variant="outline" className="text-[10px]">
                <Clock className="w-3 h-3 ml-1" />
                {toPersianDigits(training.duration)} ساعت
              </Badge>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-2">
            {training.instructor && (
              <div className="p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <User className="w-3 h-3" />
                  مدرس
                </div>
                <p className="text-xs font-medium mt-0.5">{training.instructor}</p>
              </div>
            )}
            {training.location && (
              <div className="p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  مکان
                </div>
                <p className="text-xs font-medium mt-0.5">{training.location}</p>
              </div>
            )}
            <div className="p-2 rounded-lg bg-muted/30">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                تاریخ شروع
              </div>
              <p className="text-xs font-medium mt-0.5">
                {formatShamsi(training.startDate)}
              </p>
            </div>
            {training.endDate && (
              <div className="p-2 rounded-lg bg-muted/30">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  تاریخ پایان
                </div>
                <p className="text-xs font-medium mt-0.5">
                  {formatShamsi(training.endDate)}
                </p>
              </div>
            )}
          </div>

          {training.description && (
            <div className="p-2 rounded-lg bg-muted/30">
              <p className="text-xs">{training.description}</p>
            </div>
          )}

          <Separator />

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-center">
              <p className="text-lg font-bold text-amber-600">{toPersianDigits(totalParticipants)}</p>
              <p className="text-[10px] text-muted-foreground">کل شرکت‌کنندگان</p>
            </div>
            {training.capacity && (
              <div className="p-2 rounded-lg bg-sky-50 dark:bg-sky-950/20 text-center">
                <p className="text-lg font-bold text-sky-600">{toPersianDigits(progress)}%</p>
                <p className="text-[10px] text-muted-foreground">ظرفیت</p>
              </div>
            )}
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-center">
              <p className="text-lg font-bold text-emerald-600">{toPersianDigits(completionRate)}%</p>
              <p className="text-[10px] text-muted-foreground">تکمیل</p>
            </div>
            {avgScore !== null && (
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/20 text-center">
                <p className="text-lg font-bold text-purple-600">{toPersianDigits(avgScore.toFixed(1))}</p>
                <p className="text-[10px] text-muted-foreground">میانگین نمرات</p>
              </div>
            )}
          </div>

          {/* Participant Status Breakdown */}
          {totalParticipants > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] text-muted-foreground">وضعیت شرکت‌کنندگان</p>
              <div className="grid grid-cols-4 gap-1">
                <div className="text-center p-1 rounded bg-blue-50 dark:bg-blue-950/20">
                  <p className="text-xs font-bold text-blue-600">{toPersianDigits(participantStatusCounts.registered)}</p>
                  <p className="text-[8px] text-muted-foreground">ثبت‌نام</p>
                </div>
                <div className="text-center p-1 rounded bg-amber-50 dark:bg-amber-950/20">
                  <p className="text-xs font-bold text-amber-600">{toPersianDigits(participantStatusCounts.attending)}</p>
                  <p className="text-[8px] text-muted-foreground">در حال</p>
                </div>
                <div className="text-center p-1 rounded bg-emerald-50 dark:bg-emerald-950/20">
                  <p className="text-xs font-bold text-emerald-600">{toPersianDigits(participantStatusCounts.completed)}</p>
                  <p className="text-[8px] text-muted-foreground">تکمیل</p>
                </div>
                <div className="text-center p-1 rounded bg-rose-50 dark:bg-rose-950/20">
                  <p className="text-xs font-bold text-rose-600">{toPersianDigits(participantStatusCounts.absent)}</p>
                  <p className="text-[8px] text-muted-foreground">غایب</p>
                </div>
              </div>
            </div>
          )}
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

export function EmployeeTrainingTab({ employeeId, employeeName = '' }: EmployeeTrainingTabProps) {
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // دریافت دوره‌های آموزشی کارمند
  const fetchTrainings = useCallback(async () => {
    if (!employeeId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/training?employeeId=${employeeId}`);
      if (res.ok) {
        const result = await res.json();
        const items = Array.isArray(result) ? result : (result.data || []);
        setTrainings(items);
      }
    } catch (err) {
      console.error('Error fetching trainings:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchTrainings();
  }, [fetchTrainings]);

  // آمار
  const stats = useMemo(() => {
    const total = trainings.length;
    const inProgress = trainings.filter(t => t.status === 'in_progress').length;
    const completed = trainings.filter(t => t.status === 'completed').length;
    const planned = trainings.filter(t => t.status === 'planned').length;
    const totalParticipants = trainings.reduce((sum, t) => sum + t.participants.length, 0);
    const avgScore = trainings.reduce((sum, t) => {
      const scores = t.participants
        .filter(p => p.score !== null && p.score !== undefined && p.score >= 0)
        .map(p => p.score as number);
      return sum + (scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0);
    }, 0);
    const avgScoreResult = trainings.length > 0 ? (avgScore / trainings.length) : null;

    return { total, inProgress, completed, planned, totalParticipants, avgScore: avgScoreResult };
  }, [trainings]);

  const openDetail = (training: Training) => {
    setSelectedTraining(training);
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
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-semibold">آموزش</h4>
            <p className="text-[10px] text-muted-foreground">دوره‌های آموزشی کارمند</p>
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
            <div className="text-lg font-bold text-amber-600">{toPersianDigits(stats.total)}</div>
            <div className="text-[10px] text-muted-foreground">کل دوره‌ها</div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 text-center">
            <div className="text-lg font-bold text-sky-600">{toPersianDigits(stats.inProgress)}</div>
            <div className="text-[10px] text-muted-foreground">در حال برگزاری</div>
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
            <div className="text-lg font-bold text-purple-600">{toPersianDigits(stats.totalParticipants)}</div>
            <div className="text-[10px] text-muted-foreground">شرکت‌کننده</div>
          </CardContent>
        </Card>
      </div>

      {/* Trainings List */}
      {trainings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs font-medium">دوره آموزشی ثبت نشده</p>
          <p className="text-[10px] mt-1">هیچ دوره‌ای برای این کارمند ثبت نشده است</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trainings.map(training => {
            const statusConfig = STATUS_MAP[training.status] || STATUS_MAP.planned;
            const categoryConfig = CATEGORY_MAP[training.category || ''] || { label: 'عمومی', color: 'bg-gray-100 text-gray-700' };
            const totalParticipants = training.participants.length;
            const completedParticipants = training.participants.filter(p => p.status === 'completed').length;
            const progress = training.capacity ? Math.round((totalParticipants / training.capacity) * 100) : 0;
            const completionRate = totalParticipants > 0 ? Math.round((completedParticipants / totalParticipants) * 100) : 0;

            // وضعیت شرکت‌کنندگی کارمند در این دوره
            const myParticipant = training.participants.find(p => p.employee?.id === employeeId);
            const myStatus = myParticipant ? PARTICIPANT_STATUS_MAP[myParticipant.status]?.label || myParticipant.status : null;

            return (
              <div
                key={training.id}
                className="p-4 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer border border-transparent hover:border-amber-200 dark:hover:border-amber-800"
                onClick={() => openDetail(training)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold">{training.title}</p>
                      <Badge className={`text-[10px] ${statusConfig.color}`}>{statusConfig.label}</Badge>
                      <Badge className={`text-[10px] ${categoryConfig.color}`}>{categoryConfig.label}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-muted-foreground flex-wrap">
                      {training.instructor && (
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {training.instructor}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatShamsi(training.startDate)}
                      </span>
                      {training.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {toPersianDigits(training.duration)} ساعت
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={(e) => { e.stopPropagation(); openDetail(training); }}
                  >
                    <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </div>

                <div className="mt-3 flex items-center gap-4 text-[10px]">
                  <span className="text-muted-foreground">
                    شرکت‌کنندگان: {toPersianDigits(totalParticipants)}
                    {training.capacity && ` / ${toPersianDigits(training.capacity)}`}
                  </span>
                  {training.capacity && (
                    <div className="flex-1 max-w-[100px]">
                      <Progress value={progress} className="h-1.5" />
                    </div>
                  )}
                  <span className="text-muted-foreground">
                    تکمیل: {toPersianDigits(completionRate)}%
                  </span>
                  {myStatus && (
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 ml-1" />
                      {myStatus}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Dialog */}
      <TrainingDetailDialog
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedTraining(null); }}
        training={selectedTraining}
      />
    </div>
  );
}