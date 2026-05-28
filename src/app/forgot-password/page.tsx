'use client'

import { useState, useEffect } from 'react'
import { 
  Phone, Lock, Loader2, ArrowRight, KeyRound, ShieldCheck, 
  Sparkles, Mail, CheckCircle2, AlertCircle, Users, Briefcase, Calendar, TrendingUp
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Card, CardContent, CardHeader } from '@/core/components/ui/card'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

type Step = 'request' | 'verify'

// Seeded Random Utility - Fixes Hydration Error
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Pre-generated deterministic data for floating circles
const FLOATING_CIRCLES = Array.from({ length: 4 }, (_, i) => ({
  id: i,
  size: [120, 180, 250, 300][i],
  left: [10, 65, 30, 80][i],
  top: [20, 15, 70, 55][i],
  duration: [20, 25, 18, 22][i],
  delay: [0, 2, 4, 1][i],
  opacity: [0.08, 0.06, 0.1, 0.07][i],
}))

// Stars data
const STAR_DATA = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  size: Math.round((seededRandom(i * 1.618) * 3 + 1) * 100) / 100,
  left: Math.round(seededRandom(i * 2.718) * 100),
  top: Math.round(seededRandom(i * 3.14159) * 100),
  duration: Math.round((seededRandom(i * 0.618) * 3 + 2) * 10) / 10,
  delay: Math.round(seededRandom(i * 4.669) * 2000) / 1000,
}))

// ──────────────────────────────────────────────────────────────
// کامپوننت فرم فراموشی رمز
// ──────────────────────────────────────────────────────────────
function ForgotPasswordForm({ onSuccess }: { onSuccess?: () => void }) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('request')
  const [mobile, setMobile] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugCode, setDebugCode] = useState<string | null>(null)

  const [mobileError, setMobileError] = useState('')
  const [codeError, setCodeError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const isDev = process.env.NODE_ENV === 'development'

  const validateMobile = (value: string) => {
    if (!value) { setMobileError('شماره موبایل الزامی است'); return false }
    const cleaned = value.replace(/\s/g, '')
    if (!/^09[0-9]{9}$/.test(cleaned) && !/^9[0-9]{9}$/.test(cleaned)) {
      setMobileError('شماره موبایل معتبر نیست')
      return false
    }
    setMobileError(''); return true
  }

  // مرحله ۱: ارسال کد بازیابی
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateMobile(mobile)) return
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile.replace(/\s/g, '') }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'خطا در ارسال کد بازیابی')
        return
      }

      if (data._debugCode) {
        setDebugCode(data._debugCode)
        toast.success(`کد بازیابی ارسال شد (کد تست: ${data._debugCode})`)
      } else {
        toast.success('کد بازیابی به شماره موبایل شما ارسال شد')
      }

      setStep('verify')
    } catch {
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  // مرحله ۲: تأیید کد و تغییر رمز
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code) { setCodeError('کد تأیید الزامی است'); return }
    if (!newPassword) { setPasswordError('رمز عبور جدید الزامی است'); return }
    if (newPassword.length < 4) { setPasswordError('رمز عبور باید حداقل ۴ کاراکتر باشد'); return }
    if (newPassword !== confirmPassword) { setPasswordError('رمز عبور و تکرار آن یکسان نیستند'); return }

    setCodeError('')
    setPasswordError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile.replace(/\s/g, ''),
          code,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'خطا در تغییر رمز عبور')
        return
      }

      toast.success('رمز عبور با موفقیت تغییر کرد. لطفاً وارد شوید.')
      router.push('/login')
    } catch {
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto px-6 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 blur-xl animate-pulse-slow" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-2xl">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <h2 className="text-xl font-bold text-gray-800">فراموشی رمز عبور</h2>
        <p className="text-gray-500 text-sm mt-1">
          {step === 'request' ? 'شماره موبایل خود را وارد کنید' : 'کد ارسال شده و رمز جدید را وارد کنید'}
        </p>
      </div>

      {/* Tab Switcher (نمایش مرحله) */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
        <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-white bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg">
          <ShieldCheck className="w-4 h-4" />
          <span className="text-sm">بازیابی رمز عبور</span>
        </div>
      </div>

      {/* Form */}
      <AnimatePresence mode="wait">
        <motion.form
          key={step}
          onSubmit={step === 'request' ? handleRequestCode : handleVerifyAndReset}
          className="space-y-5"
          initial={{ opacity: 0, x: step === 'request' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: step === 'request' ? 20 : -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 'request' ? (
            <>
              <div className="space-y-2">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-500" />
                  شماره موبایل
                </Label>
                <Input
                  type="tel"
                  value={mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d]/g, '').slice(0, 11)
                    setMobile(val)
                    if (mobileError) validateMobile(val)
                  }}
                  onBlur={() => validateMobile(mobile)}
                  placeholder="09123456789"
                  className="h-11 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  dir="ltr"
                />
                {mobileError && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{mobileError}</p>}
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200">
                <p className="text-teal-600 text-xs text-center">📱 کد تأیید ۵ رقمی به شماره موبایل شما ارسال می‌شود</p>
                {debugCode && (
                  <div className="mt-2 text-center">
                    <span className="text-xs text-amber-600">کد تست: </span>
                    <code className="bg-amber-100 px-2 py-0.5 rounded text-sm font-mono" dir="ltr">{debugCode}</code>
                  </div>
                )}
              </div>

              {isDev && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-slate-600 text-center text-xs mb-2">🧪 نمونه ورود آزمایشی</p>
                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-500">
                    <div className="flex justify-between"><span>موبایل:</span><code>09121234567</code></div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-teal-500/25 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><ShieldCheck className="w-4 h-4" /> ارسال کد بازیابی</>}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-teal-500" />
                  شماره موبایل
                </Label>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200 text-sm" dir="ltr">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{mobile}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-500" />
                  کد تأیید
                </Label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value.replace(/[^\d]/g, '')); if (codeError) setCodeError('') }}
                  placeholder="کد ۵ رقمی"
                  className="h-11 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  dir="ltr"
                  maxLength={5}
                />
                {codeError && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{codeError}</p>}
                {debugCode && (
                  <p className="text-xs text-amber-600 text-center">
                    کد تست: <code className="font-mono" dir="ltr">{debugCode}</code>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-500" />
                  رمز عبور جدید
                </Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); if (passwordError) setPasswordError('') }}
                  placeholder="حداقل ۴ کاراکتر"
                  className="h-11 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-teal-500" />
                  تکرار رمز عبور جدید
                </Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (passwordError) setPasswordError('') }}
                  placeholder="تکرار رمز عبور"
                  className="h-11 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  dir="ltr"
                />
                {passwordError && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3" />{passwordError}</p>}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 transition-all duration-300 shadow-lg shadow-teal-500/25 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><KeyRound className="w-4 h-4" /> تغییر رمز عبور</>}
              </Button>
            </>
          )}
        </motion.form>
      </AnimatePresence>

      {/* بازگشت به ورود */}
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => router.push('/login')}
          className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به صفحه ورود
        </button>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// Feature Card Component
// ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-lg hover:shadow-xl transition-all"
    >
      <div className="text-teal-300 mb-3">{icon}</div>
      <h3 className="text-white font-bold text-base mb-2">{title}</h3>
      <p className="text-white/70 text-xs">{description}</p>
    </motion.div>
  )
}

// ──────────────────────────────────────────────────────────────
// Main Page
// ──────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const features = [
    { icon: <Users size={28} strokeWidth={1.5} />, title: 'مدیریت کارکنان', description: 'اطلاعات کامل پرسنلی، مدارک و تاریخچه شغلی' },
    { icon: <Briefcase size={28} strokeWidth={1.5} />, title: 'حقوق و دستمزد', description: 'محاسبه خودکار حقوق، بیمه و مالیات' },
    { icon: <Calendar size={28} strokeWidth={1.5} />, title: 'حضور و غیاب', description: 'ثبت تردد، مرخصی‌ها و ماموریت‌ها' },
    { icon: <TrendingUp size={28} strokeWidth={1.5} />, title: 'ارزیابی عملکرد', description: 'مدیریت اهداف، KPI و بازخورد' }
  ]

  return (
    <div className="min-h-screen w-full overflow-hidden font-[Vazirmatn]">
      <div className="flex flex-row w-full min-h-screen">
        
        {/* ────────────────────────────────────────────────────── */}
        {/* سمت راست: 3/5 صفحه - موشن افکت + معرفی */}
        {/* ────────────────────────────────────────────────────── */}
        <div className="hidden lg:block w-3/5 relative overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-700 to-cyan-700">
          
          {/* فقط در کلاینت رندر بشه */}
          {mounted && (
            <>
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {FLOATING_CIRCLES.map((circle) => (
                  <motion.div
                    key={`circle-${circle.id}`}
                    className="absolute rounded-full bg-gradient-to-r from-white/20 to-white/5 backdrop-blur-xl border border-white/20"
                    style={{
                      width: circle.size,
                      height: circle.size,
                      left: `${circle.left}%`,
                      top: `${circle.top}%`,
                    }}
                    animate={{
                      x: [0, circle.id % 2 === 0 ? 40 : -40, 0],
                      y: [0, circle.id % 2 === 0 ? -30 : 30, 0],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: circle.duration,
                      delay: circle.delay,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>

              <div className="absolute inset-0 pointer-events-none">
                {STAR_DATA.map((star) => (
                  <motion.div
                    key={`star-${star.id}`}
                    className="absolute rounded-full bg-white/60"
                    style={{
                      width: star.size,
                      height: star.size,
                      left: `${star.left}%`,
                      top: `${star.top}%`,
                    }}
                    animate={{ opacity: [0, 0.8, 0], scale: [0.3, 1, 0.3] }}
                    transition={{ duration: star.duration, repeat: Infinity, ease: "easeInOut", delay: star.delay }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Main Content */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-12 text-center">
            
            {/* Rotating Logo */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="mb-8"
            >
              <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md shadow-xl">
                <Sparkles size={48} className="text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              سامانه جامع <span className="text-teal-200">مدیریت سازمانی</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-white/80 text-lg mb-12 max-w-md"
            >
              ابزار قدرتمند برای مدیریت منابع انسانی، حقوق و دستمزد، حضور و غیاب و ارزیابی عملکرد
            </motion.p>

            <div className="grid grid-cols-2 gap-5 max-w-xl">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={0.2 + index * 0.1}
                />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mt-12 flex gap-8 text-white/80 text-sm"
            >
              <div className="flex items-center gap-2"><ShieldCheck size={16} />امنیت بالا</div>
              <div className="flex items-center gap-2"><Sparkles size={16} />پشتیبانی ۲۴/۷</div>
              <div className="flex items-center gap-2"><Mail size={16} />نسخه موبایل</div>
            </motion.div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────── */}
        {/* سمت چپ: 2/5 صفحه - فرم فراموشی رمز */}
        {/* ────────────────────────────────────────────────────── */}
        <div className="w-full lg:w-2/5 bg-white flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <ForgotPasswordForm />
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}