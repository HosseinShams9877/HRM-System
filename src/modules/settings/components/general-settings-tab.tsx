'use client'

import { Building2, Clock, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import type { GeneralSettings } from '../index'

interface GeneralSettingsTabProps {
  general: GeneralSettings
  onGeneralChange: (updated: GeneralSettings) => void
  saving: boolean
  onSave: () => void
}

export function GeneralSettingsTab({ general, onGeneralChange, saving, onSave }: GeneralSettingsTabProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Organization Info Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              اطلاعات سازمان
            </CardTitle>
            <CardDescription className="text-[11px]">
              نام و اطلاعات پایه سازمان خود را تنظیم کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block">نام سازمان</label>
              <Input
                value={general.organizationName}
                onChange={e => onGeneralChange({ ...general, organizationName: e.target.value })}
                className="text-xs"
                placeholder="نام سازمان را وارد کنید"
              />
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">شروع سال مالی (شمسی)</label>
              <Input
                value={general.fiscalYearStart}
                onChange={e => onGeneralChange({ ...general, fiscalYearStart: e.target.value })}
                className="text-xs"
                placeholder="مثال: 1404/01/01"
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Hours Card */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              ساعات کاری
            </CardTitle>
            <CardDescription className="text-[11px]">
              زمان شروع و پایان کار و حاشیه مجاز تاخیر
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block">ساعت شروع کار</label>
                <Input
                  value={general.workHoursStart}
                  onChange={e => onGeneralChange({ ...general, workHoursStart: e.target.value })}
                  className="text-xs"
                  placeholder="08:00"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block">ساعت پایان کار</label>
                <Input
                  value={general.workHoursEnd}
                  onChange={e => onGeneralChange({ ...general, workHoursEnd: e.target.value })}
                  className="text-xs"
                  placeholder="17:00"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">حضور مجاز (دقیقه)</label>
              <Input
                type="number"
                value={general.gracePeriod}
                onChange={e => onGeneralChange({ ...general, gracePeriod: e.target.value })}
                className="text-xs"
                placeholder="15"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                حداکثر تاخیر مجاز برای ورود به ماشین‌های حضورغیاب
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-4 flex justify-end">
        <Button size="sm" onClick={onSave} disabled={saving} className="gap-1.5 text-xs">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          {saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}
        </Button>
      </div>
    </>
  )
}
