// modules/shifts/components/time-input-24h.tsx

import { Input } from '@/core/components/ui/input'
import { useState, useEffect, useRef } from 'react'
import { toPersianDigits } from '@/core/lib/utils-fa'

interface TimeInput24HProps {
  value: string | null
  onChange: (value: string | null) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function TimeInput24H({
  value,
  onChange,
  disabled = false,
  placeholder = '--:--',
  className = '',
}: TimeInput24HProps) {
  const [displayValue, setDisplayValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // تبدیل مقدار به فرمت نمایش
  const formatDisplay = (val: string | null) => {
    if (!val) return ''
    const parts = val.split(':')
    if (parts.length !== 2) return ''
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
  }

  // به‌روزرسانی مقدار نمایشی
  useEffect(() => {
    setDisplayValue(formatDisplay(value))
  }, [value])

  // اعتبارسنجی ساعت ۲۴ ساعته
  const validateAndFixTime = (input: string): string | null => {
    // حذف همه کاراکترهای غیرعددی
    const digits = input.replace(/\D/g, '')
    
    if (digits.length === 0) return null
    
    // اگر فقط یک یا دو رقم وارد شده
    if (digits.length <= 2) {
      const hours = parseInt(digits)
      if (hours >= 0 && hours <= 23) {
        return `${hours.toString().padStart(2, '0')}:00`
      }
      return null
    }
    
    // اگر سه یا چهار رقم وارد شده
    if (digits.length <= 4) {
      const hours = parseInt(digits.slice(0, 2))
      const minutes = parseInt(digits.slice(2, 4))
      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
      }
      return null
    }
    
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    // فقط اعداد رو نگه میداریم
    const digits = raw.replace(/\D/g, '')
    
    // محدودیت ۴ رقم
    const limited = digits.slice(0, 4)
    
    // نمایش فرمت شده
    let formatted = limited
    if (limited.length > 2) {
      formatted = `${limited.slice(0, 2)}:${limited.slice(2)}`
    }
    
    setDisplayValue(formatted)
    
    // اگر ۴ رقم کامل شد، اعتبارسنجی کن
    if (limited.length === 4) {
      const validated = validateAndFixTime(limited)
      onChange(validated)
    } else if (limited.length === 0) {
      onChange(null)
    }
  }

  const handleBlur = () => {
    // اگر مقدار خالی نبود و کامل نبود، کاملش کن
    if (displayValue && displayValue.length > 0) {
      const digits = displayValue.replace(/\D/g, '')
      if (digits.length > 0 && digits.length < 4) {
        const validated = validateAndFixTime(digits.padEnd(4, '0'))
        if (validated) {
          setDisplayValue(formatDisplay(validated))
          onChange(validated)
        }
      }
    }
  }

  const handleFocus = () => {
    // هنگام فوکوس، : رو حذف کن تا کاربر راحتتر تایپ کنه
    if (displayValue) {
      const digits = displayValue.replace(/\D/g, '')
      setDisplayValue(digits)
    }
  }

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        placeholder={placeholder}
        className={`h-7 text-xs w-[85px] font-mono text-center ${className}`}
        dir="ltr"
        maxLength={5}
      />
      {value && (
        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/50 pointer-events-none">
          {toPersianDigits(formatDisplay(value))}
        </span>
      )}
    </div>
  )
}