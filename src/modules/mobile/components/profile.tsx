'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Separator } from '@/core/components/ui/separator'
import {
  User, Loader2, Mail, Phone, MapPin, Calendar,
  Briefcase, Building2, Shield, Edit3, Save, X,
  Key, Eye, EyeOff
} from 'lucide-react'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'
import { toast } from 'sonner'

interface EmployeeProfile {
  id: string
  firstName: string
  lastName: string
  nationalCode: string
  personnelCode: string
  email: string | null
  phone: string | null
  avatar: string | null
  birthDate: string | null
  gender: string | null
  maritalStatus: string | null
  childrenCount: number
  education: string | null
  fieldOfStudy: string | null
  address: string | null
  hireDate: string
  position: string | null
  department: string | null
  contractType: string | null
  status: string
}

const GENDER_MAP: Record<string, string> = {
  male: 'مرد',
  female: 'زن',
}

const MARITAL_MAP: Record<string, string> = {
  single: 'مجرد',
  married: 'متاهل',
}

const CONTRACT_MAP: Record<string, string> = {
  official: 'رسمی',
  contractual: 'قراردادی',
  probation: 'آزمایشی',
  temporary: 'موقت',
}

export default function Profile() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<EmployeeProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<EmployeeProfile>>({})
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPassword: '',
    confirm: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/employees')
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setProfile(data[0])
            setEditForm(data[0])
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSaveProfile = () => {
    // In a real app, this would call an API
    if (profile) {
      setProfile({ ...profile, ...editForm } as EmployeeProfile)
    }
    setEditing(false)
    toast.success('اطلاعات شخصی با موفقیت بروزرسانی شد')
  }

  const handleChangePassword = () => {
    if (!passwordForm.current || !passwordForm.newPassword || !passwordForm.confirm) {
      toast.error('لطفاً تمام فیلدها را پر کنید')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error('رمز عبور جدید و تکرار آن مطابقت ندارند')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('رمز عبور باید حداقل ۶ کاراکتر باشد')
      return
    }
    // In a real app, this would call an API
    setChangingPassword(false)
    setPasswordForm({ current: '', newPassword: '', confirm: '' })
    toast.success('رمز عبور با موفقیت تغییر کرد')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    )
  }

  if (!profile) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <User className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">اطلاعات پروفایل یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Profile Header */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
              {profile.firstName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-bold">
                {profile.firstName} {profile.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {profile.position || '—'} • {profile.department || '—'}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                کد پرسنلی: {toPersianDigits(profile.personnelCode)}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs"
              onClick={() => setEditing(!editing)}
            >
              {editing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              {editing ? 'انصراف' : 'ویرایش'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 text-xs"
              onClick={() => setChangingPassword(!changingPassword)}
            >
              <Key className="w-3.5 h-3.5" />
              تغییر رمز
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/30">
              <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            اطلاعات شخصی
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {editing ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">نام</Label>
                  <Input
                    value={editForm.firstName || ''}
                    onChange={e => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">نام خانوادگی</Label>
                  <Input
                    value={editForm.lastName || ''}
                    onChange={e => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">ایمیل</Label>
                <Input
                  value={editForm.email || ''}
                  onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                  className="text-sm"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">تلفن</Label>
                <Input
                  value={editForm.phone || ''}
                  onChange={e => setEditForm({ ...editForm, phone: e.target.value })}
                  className="text-sm"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">آدرس</Label>
                <Input
                  value={editForm.address || ''}
                  onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                  className="text-sm"
                />
              </div>
              <Button
                className="w-full gap-2 bg-teal-500 hover:bg-teal-600"
                onClick={handleSaveProfile}
              >
                <Save className="w-4 h-4" />
                ذخیره تغییرات
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-teal-500" />
                  <span className="text-xs text-muted-foreground">ایمیل</span>
                </div>
                <span className="text-xs font-medium" dir="ltr">{profile.email || '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-teal-500" />
                  <span className="text-xs text-muted-foreground">تلفن</span>
                </div>
                <span className="text-xs font-medium" dir="ltr">{profile.phone || '—'}</span>
              </div>
              {profile.birthDate && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-teal-500" />
                    <span className="text-xs text-muted-foreground">تاریخ تولد</span>
                  </div>
                  <span className="text-xs font-medium">{formatShamsi(profile.birthDate)}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-teal-500" />
                  <span className="text-xs text-muted-foreground">جنسیت</span>
                </div>
                <span className="text-xs font-medium">{profile.gender ? GENDER_MAP[profile.gender] || profile.gender : '—'}</span>
              </div>
              <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-teal-500" />
                  <span className="text-xs text-muted-foreground">وضعیت تأهل</span>
                </div>
                <span className="text-xs font-medium">
                  {profile.maritalStatus ? MARITAL_MAP[profile.maritalStatus] || profile.maritalStatus : '—'}
                  {profile.childrenCount > 0 && ` • ${toPersianDigits(profile.childrenCount)} فرزند`}
                </span>
              </div>
              {profile.education && (
                <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-teal-500" />
                    <span className="text-xs text-muted-foreground">تحصیلات</span>
                  </div>
                  <span className="text-xs font-medium">
                    {profile.education}
                    {profile.fieldOfStudy ? ` - ${profile.fieldOfStudy}` : ''}
                  </span>
                </div>
              )}
              {profile.address && (
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-muted/50">
                  <MapPin className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                  <span className="text-xs text-muted-foreground">آدرس:</span>
                  <span className="text-xs font-medium">{profile.address}</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Job Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/30">
              <Briefcase className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            </div>
            اطلاعات شغلی
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-xs text-muted-foreground">سمت</span>
            </div>
            <span className="text-xs font-medium">{profile.position || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-xs text-muted-foreground">دپارتمان</span>
            </div>
            <span className="text-xs font-medium">{profile.department || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              <span className="text-xs text-muted-foreground">تاریخ استخدام</span>
            </div>
            <span className="text-xs font-medium">{formatShamsi(profile.hireDate)}</span>
          </div>
          {profile.contractType && (
            <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-sky-500" />
                <span className="text-xs text-muted-foreground">نوع قرارداد</span>
              </div>
              <Badge className="bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300 text-[10px]">
                {CONTRACT_MAP[profile.contractType] || profile.contractType}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      {changingPassword && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30">
                <Key className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
              </div>
              تغییر رمز عبور
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">رمز فعلی</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.current}
                  onChange={e => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="text-sm"
                />
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">رمز جدید</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="text-sm"
                />
                <button
                  type="button"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">تکرار رمز جدید</Label>
              <Input
                type="password"
                value={passwordForm.confirm}
                onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                className="text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1 gap-2 bg-teal-500 hover:bg-teal-600"
                onClick={handleChangePassword}
              >
                <Save className="w-4 h-4" />
                تغییر رمز
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setChangingPassword(false)
                  setPasswordForm({ current: '', newPassword: '', confirm: '' })
                }}
              >
                انصراف
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
