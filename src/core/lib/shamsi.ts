/**
 * توابع تقویم شمسی (جلالی)
 * توابع کمکی برای محاسبات حقوق و دستمزد و حضور و غیاب
 */

// تعداد روزهای هر ماه شمسی (ماه‌های ۱ تا ۶: ۳۱ روز، ۷ تا ۱۱: ۳۰ روز، ۱۲: ۲۹/۳۰)
export function shamsiMonthDays(year: number, month: number): number {
  if (month <= 6) return 31
  if (month <= 11) return 30
  // اسفند: کبیسه = ۳۰، معمولی = ۲۹
  // الگوریتم کبیسه شمسی: باقیمانده تقسیم سال بر ۳۳ یکی از {1, 5, 9, 13, 17, 22, 26, 30} باشد
  const remainders = [1, 5, 9, 13, 17, 22, 26, 30]
  return remainders.includes(year % 33) ? 30 : 29
}

// محاسبه تعداد روزهای اشتراک یک بازه با یک ماه شمسی خاص
export function calculateMonthOverlap(
  startDate: string,
  endDate: string | null,
  targetYear: number,
  targetMonth: number
): number {
  // روز اول و آخر ماه هدف
  const monthStart = `${targetYear}/${String(targetMonth).padStart(2, '0')}/01`
  const monthEndDay = shamsiMonthDays(targetYear, targetMonth)
  const monthEnd = `${targetYear}/${String(targetMonth).padStart(2, '0')}/${String(monthEndDay).padStart(2, '0')}`

  // اگر تاریخ شروع بعد از پایان ماه است → اشتراکی نیست
  if (startDate > monthEnd) return 0

  // اگر تاریخ پایان قبل از شروع ماه است → اشتراکی نیست
  const effectiveEnd = endDate || startDate
  if (effectiveEnd < monthStart) return 0

  // محاسبه اشتراک
  const overlapStart = startDate > monthStart ? startDate : monthStart
  const overlapEnd = effectiveEnd < monthEnd ? effectiveEnd : monthEnd

  // تبدیل به روز شماره‌دار از اول سال برای محاسبه فاصله
  const startDayNum = shamsiDateToDayNum(overlapStart)
  const endDayNum = shamsiDateToDayNum(overlapEnd)

  return Math.max(0, endDayNum - startDayNum + 1)
}

// تبدیل تاریخ شمسی به شماره روز از اول سال
export function shamsiDateToDayNum(shamsiDate: string): number {
  const [, m, d] = shamsiDate.split('/').map(Number)
  let dayNum = 0
  for (let i = 1; i < m; i++) {
    dayNum += shamsiMonthDays(0, i) // تعداد روزهای هر ماه ثابت است (بجز اسفند که ۲۹ روز فرض می‌کنیم)
  }
  dayNum += d
  return dayNum
}

// روز هفته شمسی (0=شنبه, 1=یکشنبه, ..., 6=جمعه)
export function getShamsiDayOfWeek(shamsiDate: string): number {
  try {
    const [y, m, d] = shamsiDate.split('/').map(Number)
    const jdn = shamsiToJDN(y, m, d)
    const dayOfWeekMiladi = jdn % 7
    const shamsiDayMap: Record<number, number> = {
      5: 0, // Sat → شنبه
      6: 1, // Sun → یکشنبه
      0: 2, // Mon → دوشنبه
      1: 3, // Tue → سه‌شنبه
      2: 4, // Wed → چهارشنبه
      3: 5, // Thu → پنجشنبه
      4: 6, // Fri → جمعه
    }
    return shamsiDayMap[dayOfWeekMiladi] ?? 0
  } catch {
    return 0
  }
}

// تبدیل دقیق تاریخ شمسی به Julian Day Number
// بر اساس الگوریتم تبدیل تقویم جلالی به میلادی
export function shamsiToJDN(year: number, month: number, day: number): number {
  // تبدیل شمسی به میلادی با الگوریتم دقیق
  const gy = year + 621
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]

  // تعیین کبیسه بودن سال شمسی
  const shamsiLeap = [1, 5, 9, 13, 17, 22, 26, 30].includes(year % 33)
  const daysInShamsiYear = shamsiLeap ? 366 : 365

  // محاسبه روزهای گذشته از اول فروردین
  let dayOfYear = day
  for (let i = 1; i < month; i++) {
    dayOfYear += shamsiMonthDays(year, i)
  }

  // محاسبه روزهای گذشته از اول ژانویه میلادی
  // فروردین ۱ شمسی ≈ ۲۰ یا ۲۱ مارس میلادی
  const isLeapGregorian = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0
  const marchDay = isLeapGregorian ? 20 : 21 // روز ۲۱ مارس = روز ۸۰ سال + روز ۲۰ مارس

  // محاسبه روز میلادی
  let gDayOfYear = dayOfYear + 79 // ۷۹ روز اختلاف تا اول ژانویه (تقریبی)
  let gYear = gy
  if (gDayOfYear > (isLeapGregorian ? 366 : 365)) {
    gDayOfYear -= isLeapGregorian ? 366 : 365
    gYear++
  }

  // تبدیل روز سال میلادی به تاریخ میلادی
  const isLeap = (gYear % 4 === 0 && gYear % 100 !== 0) || gYear % 400 === 0
  const monthDays = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gm = 0
  let remaining = gDayOfYear
  for (let i = 0; i < 12; i++) {
    if (remaining <= monthDays[i]) {
      gm = i + 1
      break
    }
    remaining -= monthDays[i]
  }
  if (gm === 0) gm = 12
  const gd = remaining

  // محاسبه JDN از تاریخ میلادی
  const a = Math.floor((14 - gm) / 12)
  const y = gYear + 4800 - a
  const m = gm + 12 * a - 3
  return gd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
}

// آیا شیفت شب‌کاری است؟
export function isNightShift(startTime: string, endTime: string): boolean {
  const start = parseInt(startTime.split(':')[0])
  const end = parseInt(endTime.split(':')[0])
  return start >= 22 || end >= 22 || start > end
}
