'use client'

import { useState, useEffect } from 'react'
import { KeyRound, Lock, Phone, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Card, CardContent, CardHeader } from '@/core/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [newMobile, setNewMobile] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userMobile, setUserMobile] = useState('')
  const [userRole, setUserRole] = useState('')

  const [currentPasswordError, setCurrentPasswordError] = useState('')
  const [newPasswordError, setNewPasswordError] = useState('')
  const [mobileError, setMobileError] = useState('')

  // دریافت اطلاعات کاربر از سشن
  useEffect(() => {
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUserMobile(data.user.mobile || '')
          setNewMobile(data.user.mobile || '')
          setUserRole(data.user.role || '')
          setUserId(data.user.id || '')
        }
      })
      .catch(() => {})
  }, [])

  const formatMobile = (value: string) => {
    const digits = value.replace(/[^\d]/g, '')
    if (digits.length <= 4) return digits
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`
  }

  const validateMobile = (value: string) => {
    if (!value) return true // موبایل اختیاری
    const cleaned = value.replace(/\s/g, '')
    if (!/^09[0-9]{9}$/.test(cleaned)) {
      setMobileError('شماره موبایل معتبر نیست')
      return false
    }
    setMobileError('')
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // اعتبارسنجی
    let hasError = false

    if (!currentPassword) {
      setCurrentPasswordError('رمز عبور فعلی الزامی است')
      hasError = true
    } else {
      setCurrentPasswordError('')
    }

    if (!newPassword) {
      setNewPasswordError('رمز عبور جدید الزامی است')
      hasError = true
    } else if (newPassword.length < 4) {
      setNewPasswordError('رمز عبور باید حداقل ۴ کاراکتر باشد')
      hasError = true
    } else if (newPassword !== confirmPassword) {
      setNewPasswordError('رمز عبور و تکرار آن یکسان نیستند')
      hasError = true
    } else {
      setNewPasswordError('')
    }

    if (newMobile && !validateMobile(newMobile)) {
      hasError = true
    }

    if (hasError) {
      setLoading(false)
      return
    }

    try {
      const body: Record<string, string> = {
        currentPassword,
        newPassword,
      }

      // اضافه کردن شماره موبایل فقط اگر تغییر کرده
      if (newMobile && newMobile.replace(/\s/g, '') !== userMobile.replace(/\s/g, '')) {
        body.newMobile = newMobile.replace(/\s/g, '')
      }

      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
        'x-user-id': userId,
        'x-user-role': userRole
      },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'خطا در تغییر رمز عبور')
        setLoading(false)
        return
      }

      toast.success('رمز عبور با موفقیت تغییر کرد', {
        description: 'لطفاً با رمز عبور جدید وارد شوید',
        duration: 4000,
      })

      // خروج و هدایت به صفحه ورود
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch {
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  // پرش از تغییر رمز (فقط برای ادمین)
  const handleSkip = async () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-4 relative overflow-hidden" dir="rtl">
      {/* Background decorative */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <CardHeader className="pb-4 pt-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <KeyRound className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">تغییر رمز عبور</h1>
            <p className="text-sm text-muted-foreground mt-1">
              برای امنیت حساب کاربری، رمز عبور خود را تغییر دهید
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* هشدار اولین ورود */}
            <div className="mb-5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  اولین ورود شما به سیستم است. لطفاً رمز عبور خود را تغییر دهید.
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* رمز عبور فعلی */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium">رمز عبور فعلی</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => { setCurrentPassword(e.target.value); if (currentPasswordError) setCurrentPasswordError('') }}
                    placeholder="کد ملی فعلی یا رمز قبلی"
                    className={`pr-10 pl-10 ${currentPasswordError ? 'border-red-500 focus-visible:ring-red-500/30' : ''}`}
                    dir="ltr"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {currentPasswordError && (
                  <p className="text-xs text-red-600 dark:text-red-400">{currentPasswordError}</p>
                )}
              </div>

              {/* رمز عبور جدید */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">رمز عبور جدید</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); if (newPasswordError) setNewPasswordError('') }}
                    placeholder="حداقل ۴ کاراکتر"
                    className={`pr-10 pl-10 ${newPasswordError ? 'border-red-500 focus-visible:ring-red-500/30' : ''}`}
                    dir="ltr"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* تکرار رمز عبور جدید */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">تکرار رمز عبور جدید</Label>
                <div className="relative">
                  <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); if (newPasswordError) setNewPasswordError('') }}
                    placeholder="تکرار رمز عبور جدید"
                    className="pr-10"
                    dir="ltr"
                    autoComplete="new-password"
                  />
                </div>
                {newPasswordError && (
                  <p className="text-xs text-red-600 dark:text-red-400">{newPasswordError}</p>
                )}
              </div>

              {/* تغییر شماره موبایل (فقط کارمندان) */}
              {userRole !== 'admin' && (
                <div className="space-y-2">
                  <Label htmlFor="newMobile" className="text-sm font-medium">
                    شماره موبایل
                    <span className="text-xs text-muted-foreground mr-1">(نام کاربری)</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="newMobile"
                      type="tel"
                      value={newMobile}
                      onChange={(e) => {
                        const formatted = formatMobile(e.target.value)
                        setNewMobile(formatted)
                        if (mobileError) validateMobile(formatted)
                      }}
                      placeholder="0912 345 6789"
                      className={`pr-10 ${mobileError ? 'border-red-500 focus-visible:ring-red-500/30' : ''}`}
                      dir="ltr"
                      autoComplete="tel"
                      maxLength={13}
                    />
                  </div>
                  {mobileError && (
                    <p className="text-xs text-red-600 dark:text-red-400">{mobileError}</p>
                  )}
                </div>
              )}

              {/* دکمه‌ها */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-medium bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>در حال تغییر رمز...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-5 h-5" />
                      <span>تغییر رمز عبور</span>
                    </div>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleSkip}
                >
                  بعداً تغییر می‌دهم
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/60 mt-6">
          سامانه مدیریت منابع انسانی — نسخه ۱.۰
        </p>
      </div>
    </div>
  )
}
