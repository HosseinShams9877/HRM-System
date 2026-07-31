// src/modules/payroll/components/settings/components/settings-form.tsx

'use client'

import { Button } from '@/core/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Edit3, Save, Loader2, Settings, Wallet, Shield, TrendingUp, Gift, FileText } from 'lucide-react'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { SettingsEmptyState } from './settings-empty-state'
import type { SettingsFormData } from '../types'

interface SettingsFormProps {
  year: number
  setting: any
  form: SettingsFormData
  setForm: (form: SettingsFormData) => void
  editing: boolean
  setEditing: (editing: boolean) => void
  saving: boolean
  onSave: () => void
  onRefresh: () => void
}

export function SettingsForm({
  year,
  setting,
  form,
  setForm,
  editing,
  setEditing,
  saving,
  onSave,
  onRefresh,
}: SettingsFormProps) {
  if (!setting && !editing) {
    return <SettingsEmptyState year={year} onRefresh={onRefresh} onEdit={() => setEditing(true)} />
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="w-4 h-4" />
            تنظیمات حقوقی سال {toPersianDigits(year)}
          </CardTitle>
          <Button
            variant={editing ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (editing) {
                onSave()
              } else {
                setEditing(true)
              }
            }}
            disabled={saving}
            className="gap-1"
          >
            {saving ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : editing ? (
              <Save className="w-3 h-3" />
            ) : (
              <Edit3 className="w-3 h-3" />
            )}
            {editing ? 'ذخیره' : 'ویرایش'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* بخش دستمزد */}
          <div>
            <h5 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
              <Wallet className="w-3 h-3" /> بخش دستمزد
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {[
                { key: 'minDailyWage', label: 'حداقل دستمزد روزانه (تومان)' },
                { key: 'minMonthlyWage', label: 'حداقل دستمزد ماهانه (تومان)' },
                { key: 'baseSalaryDefault', label: 'حقوق پایه پیش‌فرض (تومان)' },
                { key: 'workHoursPerDay', label: 'ساعات کار در روز' },
                { key: 'workDaysPerMonth', label: 'روزهای کار در ماه' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form[key as keyof SettingsFormData] || ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    dir="ltr"
                    disabled={!editing}
                    className={editing ? '' : 'bg-muted'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* بخش بیمه */}
          <div>
            <h5 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
              <Shield className="w-3 h-3" /> بخش بیمه
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { key: 'insuranceRate', label: 'نرخ بیمه سهم کارمند (٪)' },
                { key: 'employerInsRate', label: 'نرخ بیمه سهم کارفرما (٪)' },
                { key: 'unemploymentInsRate', label: 'بیمه بیکاری سهم کارمند (٪)' },
                { key: 'insuranceCeilingMultiplier', label: 'ضریب سقف بیمه' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form[key as keyof SettingsFormData] || ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    dir="ltr"
                    disabled={!editing}
                    className={editing ? '' : 'bg-muted'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* بخش ضرایب */}
          <div>
            <h5 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> بخش ضرایب
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { key: 'overtimeMultiplier', label: 'اضافه‌کاری' },
                { key: 'nightShiftMultiplier', label: 'شب‌کاری نوبتی' },
                { key: 'mixedNightMultiplier', label: 'شب‌کاری مختلط' },
                { key: 'fridayWorkMultiplier', label: 'جمعه‌کاری' },
                { key: 'holidayWorkMultiplier', label: 'تعطیل‌کاری' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    step="0.05"
                    value={form[key as keyof SettingsFormData] || ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    dir="ltr"
                    disabled={!editing}
                    className={editing ? '' : 'bg-muted'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* بخش عیدی و سنوات */}
          <div>
            <h5 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
              <Gift className="w-3 h-3" /> بخش عیدی و سنوات
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'eidiMinDays', label: 'حداقل روز عیدی' },
                { key: 'eidiMaxDays', label: 'حداکثر روز عیدی' },
                { key: 'sanavatRate', label: 'نرخ سنوات (٪ حقوق پایه/سال)' },
                { key: 'sanavatMaxYears', label: 'حداکثر سال سابقه مشمول' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-1">
                  <Label className="text-xs">{label}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={form[key as keyof SettingsFormData] || ''}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    dir="ltr"
                    disabled={!editing}
                    className={editing ? '' : 'bg-muted'}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* بخش مالیات */}
          <div>
            <h5 className="text-xs font-semibold mb-2 text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" /> بخش مالیات
            </h5>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">معافیت مالیاتی ماهانه (تومان)</Label>
                <Input
                  type="number"
                  value={form.taxExemptAmount || ''}
                  onChange={(e) => setForm({ ...form, taxExemptAmount: e.target.value })}
                  dir="ltr"
                  disabled={!editing}
                  className={editing ? '' : 'bg-muted'}
                />
              </div>
            </div>
          </div>

          {editing && (
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditing(false)
                  onRefresh()
                }}
              >
                انصراف
              </Button>
              <Button size="sm" onClick={onSave} disabled={saving} className="gap-1">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                ذخیره تنظیمات
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}