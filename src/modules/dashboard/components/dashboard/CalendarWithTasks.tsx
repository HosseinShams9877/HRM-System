'use client';

import React, { useState } from 'react';
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
  CalendarCheck,
  Briefcase
} from 'lucide-react';
import { toPersianDigits, formatShamsiFull, getTodayShamsi } from '@/core/lib/utils-fa';
import jalaali from 'jalaali-js';

// ============================================
// Types
// ============================================

interface Task {
  id: string;
  title: string;
  type: 'interview' | 'evaluation' | 'training' | 'mission' | 'leave';
  time?: string;
  description?: string;
}

interface DayTasks {
  date: string; // به فرمت شمسی: YYYY/MM/DD
  tasks: Task[];
}

interface CalendarWithTasksProps {
  onTaskClick?: (task: Task) => void;
  userRole?: string;
}

// داده‌های دمو با تاریخ شمسی
const DEMO_TASKS: DayTasks[] = [
  { 
    date: '1405/02/28', 
    tasks: [
      { id: '1', title: 'مصاحبه با نامزد شماره 1', type: 'interview', time: '10:00', description: 'موقعیت: توسعه‌دهنده ارشد' },
      { id: '2', title: 'ارزیابی عملکرد تیم فروش', type: 'evaluation', time: '14:00', description: 'ارزیابی نیم‌سال' }
    ] 
  },
  { 
    date: '1405/03/01', 
    tasks: [
      { id: '3', title: 'ارزیابی عملکرد تیم فروش', type: 'evaluation', time: '14:00', description: 'ارزیابی نیم‌سال' }
    ] 
  },
  { 
    date: '1405/03/05', 
    tasks: [
      { id: '4', title: 'پایان دوره آموزشی React', type: 'training', time: '09:00', description: 'آزمون پایانی' }
    ] 
  },
  { 
    date: '1405/03/12', 
    tasks: [
      { id: '5', title: 'مصاحبه فنی', type: 'interview', time: '11:30', description: 'سمت: فول‌استک' }
    ] 
  },
  { 
    date: '1405/03/15', 
    tasks: [
      { id: '6', title: 'ارزیابی عملکرد مدیران', type: 'evaluation', time: '09:00', description: 'ارزیابی سالانه' }
    ] 
  },
  { 
    date: '1405/03/20', 
    tasks: [
      { id: '7', title: 'دوره آموزشی مدیریت پروژه', type: 'training', time: '15:00', description: 'جلسه پایانی' }
    ] 
  },
];

// نقشه آیکون‌ها بر اساس نوع تسک
const taskIcons = {
  interview: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', label: 'مصاحبه' },
  evaluation: { icon: ClipboardList, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', label: 'ارزیابی' },
  training: { icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/30', label: 'آموزش' },
  mission: { icon: Briefcase, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', label: 'ماموریت' },
  leave: { icon: CalendarCheck, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/30', label: 'مرخصی' },
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
export function CalendarWithTasks({ onTaskClick, userRole }: CalendarWithTasksProps) {
  // تاریخ جاری به شمسی
  const todayShamsi = getTodayShamsi();
  const [currentYear, setCurrentYear] = useState(todayShamsi.year);
  const [currentMonth, setCurrentMonth] = useState(todayShamsi.month);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasks, setTasks] = useState<DayTasks[]>(DEMO_TASKS);

  // گرفتن تعداد روزهای ماه شمسی
  const getDaysInMonth = (year: number, month: number): number => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    // اسفند: کبیسه = 30، معمولی = 29
    const remainders = [1, 5, 9, 13, 17, 22, 26, 30];
    return remainders.includes(year % 33) ? 30 : 29;
  };

  // گرفتن روز هفته اولین روز ماه (0 = شنبه)
  const getFirstDayOfMonth = (year: number, month: number): number => {
    // تبدیل اول ماه شمسی به میلادی
    const { gy, gm, gd } = jalaali.toGregorian(year, month, 1);
    const firstDay = new Date(gy, gm - 1, gd).getDay();
    // تبدیل یکشنبه (0) به شنبه (0) و غیره
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

  // گرفتن تسک‌های یک روز خاص
  const getTasksForDate = (dateStr: string): Task[] => {
    const dayTasks = tasks.find(t => t.date === dateStr);
    return dayTasks?.tasks || [];
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

  // تسک‌های روز انتخاب شده
  const selectedTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  // تعداد روزهای ماه جاری
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // تاریخ امروز برای هایلایت
  const isToday = (day: number): boolean => {
    return currentYear === todayShamsi.year && 
           currentMonth === todayShamsi.month && 
           day === todayShamsi.day;
  };

  return (
    <Card className="border-0 shadow-xl overflow-hidden h-full flex flex-col bg-white dark:bg-gray-900">
      <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="text-gray-800 dark:text-gray-100">تقویم رویدادها</span>
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
            const dayTasks = getTasksForDate(dateKey);
            const hasTasks = dayTasks.length > 0;
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
                  ${!isSelectedDate && hasTasks ? 'bg-emerald-50 dark:bg-emerald-900/30' : ''}
                  ${!isSelectedDate && !hasTasks ? 'hover:bg-gray-50 dark:hover:bg-gray-800' : ''}
                  ${isTodayDate && !isSelectedDate ? 'border-2 border-emerald-300 dark:border-emerald-600' : ''}
                `}
              >
                <span className={`text-xs font-medium ${isSelectedDate ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                  {toPersianDigits(day)}
                </span>
                {hasTasks && !isSelectedDate && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                )}
              </motion.button>
            );
          })}
        </div>
  
        {/* تسک‌های روز انتخاب شده */}
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
                  اقدامات روز {toPersianDigits(parseInt(selectedDate.split('/')[2]))} {PERSIAN_MONTHS[currentMonth - 1]}
                </span>
              </div>
  
              {selectedTasks.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <CheckCircle className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">هیچ اقدامی برای این روز ثبت نشده است</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedTasks.map((task) => {
                    const TaskIcon = taskIcons[task.type].icon;
                    const colors = taskIcons[task.type];
                    
                    return (
                      <motion.div
                        key={task.id}
                        whileHover={{ scale: 1.01, x: 4 }}
                        onClick={() => onTaskClick?.(task)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${colors.bg} border-${colors.color.split('-')[1]}-200 dark:border-${colors.color.split('-')[1]}-800`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-lg bg-white dark:bg-gray-800 shadow-sm ${colors.color}`}>
                            <TaskIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">{task.title}</h4>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.bg} ${colors.color} dark:bg-opacity-20`}>
                                {taskIcons[task.type].label}
                              </span>
                            </div>
                            {task.time && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {task.time}
                              </p>
                            )}
                            {task.description && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{task.description}</p>
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
      </CardContent>
    </Card>
  );
}

export default CalendarWithTasks;