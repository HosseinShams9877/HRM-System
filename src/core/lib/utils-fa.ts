/**
 * Utility functions for Persian/Farsi support
 * اعداد فارسی، تاریخ شمسی، و تبدیل‌ها
 */

 import jalaali from 'jalaali-js'
 import moment from 'moment-jalaali'

 // ============================================
 // اعداد فارسی
 // ============================================
 
 const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
 const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
 
 /** تبدیل عدد به ارقام فارسی */
 export function toPersianDigits(num: number | string): string {
   return String(num).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[parseInt(d)])
 }

 export function convertPersianToGregorian(persianDate: string): Date | null {
  if (!persianDate) return null
  
  // تنظیم moment برای تقویم جلالی
  moment.loadPersian({ usePersianDigits: false })
  
  // پشتیبانی از فرمت‌های مختلف
  let m = moment(persianDate, 'jYYYY/jMM/jDD')
  
  // اگر با / کار نکرد، با - تست کن
  if (!m.isValid()) {
    m = moment(persianDate, 'jYYYY-jMM-jDD')
  }
  
  // اگر باز هم کار نکرد
  if (!m.isValid()) {
    // ممکنه تاریخ میلادی باشه
    try {
      const date = new Date(persianDate)
      if (!isNaN(date.getTime())) return date
    } catch {
      return null
    }
    return null
  }
  
  // تبدیل به Date میلادی
  return m.toDate()
}

// src/modules/employees/components/EmployeeArchive.tsx

// ============================================
// Helper Functions
// ============================================

// تبدیل تاریخ میلادی به شمسی با اعداد فارسی
 export const convertToPersianDate = (dateString: string | Date): string => {
  if (!dateString) return ''
  
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  if (isNaN(date.getTime())) return ''
  
  const persianDate = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  
  // ✅ تبدیل اعداد انگلیسی به فارسی
  return toPersianDigits(persianDate)
}

// فرمت تاریخ برای نمایش
const formatDate = (dateStr: string) => {
  if (!dateStr) return '—'
  return convertToPersianDate(dateStr)
}
 /** تبدیل ارقام فارسی به انگلیسی */
 export function toEnglishDigits(str: string): string {
   return str.replace(/[۰-۹]/g, (d) =>
     String(ENGLISH_DIGITS[PERSIAN_DIGITS.indexOf(d)])
   )
 }
 
 /** فرمت عدد با جداکننده هزارگان فارسی */
 export function formatPersianNumber(num: number): string {
   const formatted = num.toLocaleString('fa-IR')
   return toPersianDigits(formatted)
 }
 
 /** فرمت مبالغ پولی (تومان) */
 export function formatCurrency(amount: number): string {
   if (amount >= 1_000_000_000) {
     return toPersianDigits((amount / 1_000_000_000).toFixed(1)) + ' میلیارد'
   }
   if (amount >= 1_000_000) {
     return toPersianDigits((amount / 1_000_000).toFixed(1)) + ' میلیون'
   }
   return formatPersianNumber(amount) + ' تومان'
 }
 
 // ============================================
 // تاریخ شمسی
 // ============================================
 
 const PERSIAN_MONTHS = [
   'فروردین', 'اردیبهشت', 'خرداد',
   'تیر', 'مرداد', 'شهریور',
   'مهر', 'آبان', 'آذر',
   'دی', 'بهمن', 'اسفند'
 ]
 
 const PERSIAN_WEEKDAYS = [
   'یکشنبه', 'دوشنبه', 'سه‌شنبه',
   'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'
 ]
 
 /** گرفتن تاریخ شمسی امروز */
 export function getTodayShamsi(): { year: number; month: number; day: number } {
   const now = new Date()
   const { jy, jm, jd } = jalaali.toJalaali(now.getFullYear(), now.getMonth() + 1, now.getDate())
   return { year: jy, month: jm, day: jd }
 }
 
 /** تبدیل Date به رشته شمسی: 1405/01/03 */
 export function toShamsi(date: Date): string {
   const { jy, jm, jd } = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
   return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`
 }
 /*
 export function formatShamsi(dateStr: string): string {
   if (!dateStr) return ''
   const parts = dateStr.split('/')
   if (parts.length !== 3) return dateStr
   const [y, m, d] = parts.map(Number)
   const monthName = PERSIAN_MONTHS[m - 1] || ''
   return `${toPersianDigits(d)} ${monthName} ${toPersianDigits(y)}`
 }
 */


/** فرمت زیبای تاریخ شمسی: ۴ خرداد ۱۴۰۴ */
export function formatShamsi(dateStr: string): string {
  if (!dateStr) return ''

  let shamsiYear: number, shamsiMonth: number, shamsiDay: number

  // ۱. اگه تاریخ به فرمت میلادی YYYY-MM-DD باشه (مثل 2025-08-26)
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr
    const jalaaliDate = jalaali.toJalaali(year, month, day)
    shamsiYear = jalaaliDate.jy
    shamsiMonth = jalaaliDate.jm
    shamsiDay = jalaaliDate.jd
  }
  // ۲. اگه تاریخ به فرمت شمسی YYYY/MM/DD باشه (مثل 1404/01/01)
  else if (dateStr.includes('/')) {
    const parts = dateStr.split('/')
    if (parts.length !== 3) return dateStr
    shamsiYear = parseInt(parts[0])
    shamsiMonth = parseInt(parts[1])
    shamsiDay = parseInt(parts[2])
    if (isNaN(shamsiYear) || isNaN(shamsiMonth) || isNaN(shamsiDay)) return dateStr
  }
  // ۳. فرمت دیگه
  else {
    return dateStr
  }

  const monthName = PERSIAN_MONTHS[shamsiMonth - 1] || ''
  return `${toPersianDigits(shamsiDay)} ${monthName} ${toPersianDigits(shamsiYear)}`
}

export function convertMiladiToShamsi(dateStr: string): string {
  if (!dateStr) return ''

  // تبدیل - به / برای یکسان سازی
  const cleanDate = dateStr.replace(/-/g, '/')
  const parts = cleanDate.split('/')
  
  if (parts.length !== 3) return dateStr

  const year = parseInt(parts[0])
  const month = parseInt(parts[1])
  const day = parseInt(parts[2])

  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr

  // تبدیل میلادی به شمسی با jalaali-js
  const jalaaliDate = jalaali.toJalaali(year, month, day)
  
  const jy = String(jalaaliDate.jy).padStart(4, '0')
  const jm = String(jalaaliDate.jm).padStart(2, '0')
  const jd = String(jalaaliDate.jd).padStart(2, '0')

  return `${jy}/${jm}/${jd}`
}
 /** فرمت کامل تاریخ شمسی با روز هفته: پنجشنبه ۳ فروردین ۱۴۰۵ */
 export function formatShamsiFull(dateStr: string): string {
   if (!dateStr) return ''
   const parts = dateStr.split('/')
   if (parts.length !== 3) return dateStr
   const [y, m, d] = parts.map(Number)
   
   // تبدیل شمسی به میلادی برای گرفتن روز هفته
   const gregorian = jalaali.toGregorian(y, m, d)
   const date = new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd)
   const weekday = PERSIAN_WEEKDAYS[date.getDay()]
   const monthName = PERSIAN_MONTHS[m - 1] || ''
   
   return `${weekday} ${toPersianDigits(d)} ${monthName} ${toPersianDigits(y)}`
 }
 
 /** گرفتن نام ماه شمسی */
 export function getShamsiMonthName(month: number): string {
   return PERSIAN_MONTHS[month - 1] || ''
 }
 
 /** گرفتن امروز به فرمت زیبا */
 export function getTodayFormatted(): string {
   const today = getTodayShamsi()
   const dateStr = `${today.year}/${String(today.month).padStart(2, '0')}/${String(today.day).padStart(2, '0')}`
   return formatShamsiFull(dateStr)
 }
 
 /** فرمت زمان نسبی: ۱۰ دقیقه پیش */
 export function formatRelativeTime(date: Date): string {
   const now = new Date()
   const diffMs = now.getTime() - date.getTime()
   const diffSec = Math.floor(diffMs / 1000)
   const diffMin = Math.floor(diffSec / 60)
   const diffHour = Math.floor(diffMin / 60)
   const diffDay = Math.floor(diffHour / 24)
 
   if (diffSec < 60) return toPersianDigits(diffSec) + ' ثانیه پیش'
   if (diffMin < 60) return toPersianDigits(diffMin) + ' دقیقه پیش'
   if (diffHour < 24) return toPersianDigits(diffHour) + ' ساعت پیش'
   if (diffDay < 7) return toPersianDigits(diffDay) + ' روز پیش'
   
   return formatShamsi(toShamsi(date))
 }
 
 /** گرفتن روزهای هفته شمسی برای نمودار */
 export function getWeekDaysShamsi(): string[] {
   const today = new Date()
   const days: string[] = []
   for (let i = 6; i >= 0; i--) {
     const d = new Date(today)
     d.setDate(d.getDate() - i)
     const { jd, jm } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate())
     days.push(toPersianDigits(jd) + ' ' + getShamsiMonthName(jm))
   }
   return days
 }
 
 export function getCurrentTimeFormatted(): string {
   const now = new Date()
   const hours = now.getHours()
   const minutes = now.getMinutes()
   const seconds = now.getSeconds()
   
   return `${toPersianDigits(hours)}:${toPersianDigits(minutes)}:${toPersianDigits(seconds)}`
 }
 
 // ============================================
 // تعطیلات رسمی ایران (نمونه)
 // ============================================
 
 export const IRAN_HOLIDAYS_1404: Record<string, string> = {
   '1404/01/01': 'عید نوروز',
   '1404/01/02': 'عید نوروز',
   '1404/01/03': 'عید نوروز',
   '1404/01/04': 'عید نوروز',
   '1404/01/12': 'روز جمهوری اسلامی',
   '1404/01/13': 'سیزده‌بدر',
   '1404/03/14': 'رحلت امام خمینی',
   '1404/03/15': 'قیام ۱۵ خرداد',
   '1404/11/22': 'پیروزی انقلاب اسلامی',
   '1404/12/29': 'ملی شدن صنعت نفت',
 }
 
 export const IRAN_HOLIDAYS_1405: Record<string, string> = {
   '1405/01/01': 'عید نوروز',
   '1405/01/02': 'عید نوروز',
   '1405/01/03': 'عید نوروز',
   '1405/01/04': 'عید نوروز',
   '1405/01/12': 'روز جمهوری اسلامی',
   '1405/01/13': 'سیزده‌بدر',
   '1405/03/14': 'رحلت امام خمینی',
   '1405/03/15': 'قیام ۱۵ خرداد',
   '1405/11/22': 'پیروزی انقلاب اسلامی',
   '1405/12/29': 'ملی شدن صنعت نفت',
 }
 
 /** چک کردن تعطیل بودن */
 export function isHoliday(dateStr: string): boolean {
   return !!(IRAN_HOLIDAYS_1405[dateStr] || IRAN_HOLIDAYS_1404[dateStr])
 }
 