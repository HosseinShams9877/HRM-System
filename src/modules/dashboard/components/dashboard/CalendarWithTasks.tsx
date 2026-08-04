'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';
import { Button } from '@/core/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Users,
  ClipboardList,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toPersianDigits, getTodayShamsi } from '@/core/lib/utils-fa';
import jalaali from 'jalaali-js';

// ============================================
// Types
// ============================================

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  type: 'interview' | 'training' | 'evaluation';
  time?: string;
  description?: string;
  status?: string;
  metadata?: any;
}

interface DayTasks {
  date: string;
  tasks: CalendarEvent[];
}

// ============================================
// نقشه آیکون‌ها بر اساس نوع تسک
// ============================================

const taskIcons = {
  interview: { 
    icon: Users, 
    color: 'text-blue-500', 
    bg: 'bg-blue-50 dark:bg-blue-950/30', 
    label: 'مصاحبه' 
  },
  evaluation: { 
    icon: ClipboardList, 
    color: 'text-amber-500', 
    bg: 'bg-amber-50 dark:bg-amber-950/30', 
    label: 'ارزیابی' 
  },
  training: { 
    icon: GraduationCap, 
    color: 'text-emerald-500', 
    bg: 'bg-emerald-50 dark:bg-emerald-950/30', 
    label: 'آموزش' 
  },
};

// نام ماه‌های شمسی
const PERSIAN_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

// روزهای هفته (شنبه = 0)
const WEEKDAYS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];

// ============================================
// کامپوننت اصلی
// ============================================

interface CalendarWithTasksProps {
  onTaskClick?: (task: CalendarEvent) => void;
  userRole?: string; // ✅ اضافه شد
}

export function CalendarWithTasks({ onTaskClick, userRole = 'employee' }: CalendarWithTasksProps) {
  // تاریخ جاری به شمسی
  const todayShamsi = getTodayShamsi();
  const [currentYear, setCurrentYear] = useState(todayShamsi.year);
  const [currentMonth, setCurrentMonth] = useState(todayShamsi.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  // State برای دیتا
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // دریافت دیتا از API
  // ============================================

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        // دریافت همه دیتاها با Promise.all
        const [interviewsRes, trainingsRes, evaluationsRes] = await Promise.all([
          fetch('/api/interviews'),
          fetch('/api/training'),
          fetch('/api/performance')
        ]);

        // بررسی خطاها
        if (!interviewsRes.ok || !trainingsRes.ok || !evaluationsRes.ok) {
          throw new Error('خطا در دریافت داده‌ها');
        }

        // دریافت دیتاها
        const interviewsData = await interviewsRes.json();
        const trainingsData = await trainingsRes.json();
        const evaluationsData = await evaluationsRes.json();

        // تبدیل مصاحبه‌ها به فرمت تقویم
        const interviewEvents: CalendarEvent[] = (interviewsData || [])
          .filter((item: any) => item.status === 'scheduled' || item.status === 'rescheduled')
          .map((item: any) => ({
            id: `interview-${item.id}`,
            title: `مصاحبه با ${item.candidate?.firstName || ''} ${item.candidate?.lastName || ''}`,
            date: convertGregorianToShamsi(item.scheduledAt),
            time: extractTime(item.scheduledAt),
            type: 'interview',
            description: item.job?.title ? `سمت: ${item.job.title}` : undefined,
            status: item.status,
            metadata: {
              applicationId: item.applicationId,
              candidateId: item.candidateId,
            }
          }));

        // تبدیل آموزش‌ها به فرمت تقویم
const trainingEvents: CalendarEvent[] = (trainingsData.data || [])
.filter((item: any) => item.status === 'planned' || item.status === 'in_progress')
.map((item: any) => ({
  id: `training-${item.id}`,
  title: item.title,
  date: item.startDate,
  endDate: item.endDate || undefined,
  type: 'training',
  description: item.location ? `مکان: ${item.location}` : undefined,
  status: item.status,
  metadata: {
    instructor: item.instructor,
    capacity: item.capacity,
    category: item.category,
  }
}));

        // تبدیل ارزیابی‌ها به فرمت تقویم (فقط pending و in_progress)
        const evaluationEvents: CalendarEvent[] = (evaluationsData.data || [])
          .filter((item: any) => item.status === 'pending' || item.status === 'in_progress')
          .map((item: any) => ({
            id: `evaluation-${item.id}`,
            title: `ارزیابی عملکرد - ${item.employee?.firstName || ''} ${item.employee?.lastName || ''}`,
            date: convertGregorianToShamsi(item.createdAt),
            type: 'evaluation',
            description: item.period ? `دوره: ${item.period}` : undefined,
            status: item.status,
            metadata: {
              score: item.score,
              employeeId: item.employeeId,
            }
          }));

        // ترکیب همه رویدادها
        let allEvents = [...interviewEvents, ...trainingEvents, ...evaluationEvents];
        
        // فیلتر بر اساس نقش کاربر
        allEvents = filterEventsByRole(allEvents, userRole);

        setEvents(allEvents);

      } catch (err) {
        console.error('Error fetching events:', err);
        setError('خطا در دریافت رویدادها');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [userRole]);

  // ============================================
  // توابع کمکی
  // ============================================

  // تبدیل تاریخ میلادی به شمسی
  const convertGregorianToShamsi = (date: Date | string): string => {
    const d = new Date(date);
    const { jy, jm, jd } = jalaali.toJalaali(
      d.getFullYear(),
      d.getMonth() + 1,
      d.getDate()
    );
    return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
  };

  // استخراج ساعت از تاریخ
  const extractTime = (date: Date | string): string => {
    const d = new Date(date);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  // فیلتر رویدادها بر اساس نقش
  const filterEventsByRole = (events: CalendarEvent[], role: string): CalendarEvent[] => {
    switch(role) {
      case 'admin':
        // ادمین همه چیز رو میبینه
        return events;
      
      case 'hr_manager':
        // مدیر منابع انسانی: مصاحبه و ارزیابی
        return events.filter(e => 
          e.type === 'interview' || 
          e.type === 'evaluation'
        );
      
      case 'manager':
        // مدیر: ارزیابی و آموزش
        return events.filter(e => 
          e.type === 'evaluation' || 
          e.type === 'training'
        );
      
      case 'employee':
        // کارمند: فقط آموزش‌ها
        return events.filter(e => e.type === 'training');
      
      default:
        return events;
    }
  };

  // گرفتن تعداد روزهای ماه شمسی
  const getDaysInMonth = (year: number, month: number): number => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    const remainders = [1, 5, 9, 13, 17, 22, 26, 30];
    return remainders.includes(year % 33) ? 30 : 29;
  };

  // گرفتن روز هفته اولین روز ماه (0 = شنبه)
  const getFirstDayOfMonth = (year: number, month: number): number => {
    const { gy, gm, gd } = jalaali.toGregorian(year, month, 1);
    const firstDay = new Date(gy, gm - 1, gd).getDay();
    return (firstDay + 1) % 7;
  };

  // تغییر ماه
  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
  };

  // گرفتن رویدادهای یک روز خاص
  const getEventsForDate = (dateStr: string): CalendarEvent[] => {
    return events.filter(event => {
      // بررسی تاریخ اصلی
      if (event.date === dateStr) return true;
      
      // بررسی بازه زمانی (برای رویدادهای چند روزه)
      if (event.endDate) {
        const start = new Date(event.date.split('/').join('/'));
        const end = new Date(event.endDate.split('/').join('/'));
        const current = new Date(dateStr.split('/').join('/'));
        return current >= start && current <= end;
      }
      
      return false;
    });
  };

  // فرمت تاریخ به شمسی
  const formatDateKey = (year: number, month: number, day: number): string => {
    return `${year}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`;
  };

  // انتخاب روز
  const handleDateClick = (day: number) => {
    const dateKey = formatDateKey(currentYear, currentMonth, day);
    setSelectedDate(dateKey);
  };

  // رویدادهای روز انتخاب شده
  const selectedEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  // تعداد روزهای ماه جاری
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // تاریخ امروز برای هایلایت
  const isToday = (day: number): boolean => {
    return currentYear === todayShamsi.year && 
           currentMonth === todayShamsi.month && 
           day === todayShamsi.day;
  };

  // ============================================
  // رندرینگ
  // ============================================

  // نمایش لودینگ
  if (loading) {
    return (
      <Card className="border-0 shadow-xl h-full flex flex-col bg-white dark:bg-gray-900">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">در حال بارگذاری رویدادها...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // نمایش خطا
  if (error) {
    return (
      <Card className="border-0 shadow-xl h-full flex flex-col bg-white dark:bg-gray-900">
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              تلاش مجدد
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-xl overflow-hidden h-full flex flex-col bg-white dark:bg-gray-900">
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-gray-800 dark:text-gray-100">تقویم رویدادها</span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mr-2">
              ({events.length} رویداد)
            </span>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevMonth}
              className="h-8 w-8 p-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center text-gray-700 dark:text-gray-300">
              {PERSIAN_MONTHS[currentMonth - 1]} {toPersianDigits(currentYear)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="h-8 w-8 p-0 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
  
      <CardContent className="p-4 flex-1 overflow-y-auto">
        {/* روزهای هفته */}
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {WEEKDAYS.map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
  
        {/* روزهای ماه */}
        <div className="grid grid-cols-7 gap-1 auto-rows-min">
          {/* روزهای خالی اول ماه */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8 rounded-lg" />
          ))}
  
          {/* روزهای ماه */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = formatDateKey(currentYear, currentMonth, day);
            const dayEvents = getEventsForDate(dateKey);
            const hasEvents = dayEvents.length > 0;
            const isSelectedDate = selectedDate === dateKey;
            const isTodayDate = isToday(day);
            
            return (
              <motion.button
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDateClick(day)}
                className={`
                  relative h-8 rounded-lg flex flex-col items-center justify-center
                  transition-all duration-200
                  ${isSelectedDate ? 'bg-emerald-500 text-white shadow-md' : ''}
                  ${!isSelectedDate && hasEvents ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}
                  ${!isSelectedDate && !hasEvents ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
                  ${isTodayDate && !isSelectedDate ? 'border-2 border-emerald-300 dark:border-emerald-600' : ''}
                `}
              >
                <span className={`text-xs font-medium ${isSelectedDate ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {toPersianDigits(day)}
                </span>
                {hasEvents && !isSelectedDate && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                )}
              </motion.button>
            );
          })}
        </div>
  
        {/* رویدادهای روز انتخاب شده */}
        <AnimatePresence mode="wait">
          {selectedDate && (
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  رویدادهای روز {toPersianDigits(parseInt(selectedDate.split('/')[2]))} {PERSIAN_MONTHS[currentMonth - 1]}
                </span>
              </div>
  
              {selectedEvents.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">هیچ رویدادی برای این روز ثبت نشده است</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedEvents.map((event) => {
                    const TaskIcon = taskIcons[event.type].icon;
                    const colors = taskIcons[event.type];
                    
                    return (
                      <motion.div
                        key={event.id}
                        whileHover={{ scale: 1.01, x: 4 }}
                        onClick={() => onTaskClick?.(event)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${colors.bg} border-${colors.color.split('-')[1]}-200 dark:border-${colors.color.split('-')[1]}-800`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${colors.color}`}>
                            <TaskIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{event.title}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.bg} ${colors.color} dark:bg-opacity-20`}>
                                {taskIcons[event.type].label}
                              </span>
                            </div>
                            {event.time && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {event.time}
                              </p>
                            )}
                            {event.description && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{event.description}</p>
                            )}
                            {event.status && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                وضعیت: {event.status === 'scheduled' ? 'برنامه‌ریزی شده' : 
                                         event.status === 'completed' ? 'تکمیل شده' :
                                         event.status === 'planned' ? 'برنامه‌ریزی شده' :
                                         event.status === 'in_progress' ? 'در حال اجرا' :
                                         event.status === 'reviewed' ? 'بررسی شده' : event.status}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* نمایش پیام وقتی هیچ رویدادی نیست */}
        {events.length === 0 && !loading && !error && (
          <div className="mt-4 text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <CheckCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">هیچ رویدادی برای نمایش وجود ندارد</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CalendarWithTasks;