// src/modules/payroll/components/settings/hooks/use-settings.ts

import { useState, useCallback } from 'react'
import { useToast } from '@/core/hooks/use-toast'
import { RIALS_TO_TOMANS } from '../../../constants'
import type { SettingsFormData } from '../types'

export function useSettings(year: number) {
  const { toast } = useToast()
  const [setting, setSetting] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<SettingsFormData>({} as SettingsFormData)

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/payroll/settings?year=${year}`)
      if (res.ok) {
        const json = await res.json()
        const s = json.setting
        setSetting(s)
        if (s) {
          setForm({
            minDailyWage: String(RIALS_TO_TOMANS(s.minDailyWage)),
            minMonthlyWage: String(RIALS_TO_TOMANS(s.minMonthlyWage || s.minDailyWage * (s.workDaysPerMonth || 30))),
            baseSalaryDefault: String(RIALS_TO_TOMANS(s.baseSalaryDefault || 0)),
            workHoursPerDay: String(s.workHoursPerDay || 8),
            workDaysPerMonth: String(s.workDaysPerMonth || 30),
            insuranceRate: String(s.insuranceRate || 7),
            employerInsRate: String(s.employerInsRate || 23),
            unemploymentInsRate: String(s.unemploymentInsRate || 1),
            insuranceCeilingMultiplier: String(s.insuranceCeilingMultiplier || 7),
            overtimeMultiplier: String(s.overtimeMultiplier || 1.4),
            nightShiftMultiplier: String(s.nightShiftMultiplier || 1.15),
            mixedNightMultiplier: String(s.mixedNightMultiplier || 1.35),
            fridayWorkMultiplier: String(s.fridayWorkMultiplier || 1.4),
            holidayWorkMultiplier: String(s.holidayWorkMultiplier || 1.4),
            eidiMinDays: String(s.eidiMinDays || 60),
            eidiMaxDays: String(s.eidiMaxDays || 90),
            sanavatRate: String(s.sanavatRate || 0),
            sanavatMaxYears: String(s.sanavatMaxYears || 30),
            taxExemptAmount: String(s.taxExemptAmount || 0),
          })
        }
      }
    } catch (err) {
      console.error('Fetch settings error:', err)
    } finally {
      setLoading(false)
    }
  }, [year])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const body: Record<string, unknown> = { year }
      const rialFields = ['minDailyWage', 'minMonthlyWage', 'baseSalaryDefault', 'taxExemptAmount']
      const numericFields = [
        'workHoursPerDay', 'workDaysPerMonth',
        'insuranceRate', 'employerInsRate', 'unemploymentInsRate', 'insuranceCeilingMultiplier',
        'overtimeMultiplier', 'nightShiftMultiplier', 'mixedNightMultiplier',
        'fridayWorkMultiplier', 'holidayWorkMultiplier',
        'eidiMinDays', 'eidiMaxDays', 'sanavatRate', 'sanavatMaxYears'
      ]

      for (const key of [...rialFields, ...numericFields]) {
        const value = Number(form[key as keyof SettingsFormData] || 0)
        body[key] = rialFields.includes(key) ? value * 10 : value
      }

      const method = setting ? 'PUT' : 'POST'
      const res = await fetch('/api/payroll/settings', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        toast({ title: 'تنظیمات ذخیره شد' })
        setEditing(false)
        fetchSettings()
      } else {
        const err = await res.json()
        toast({ title: err.error || 'خطا', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'خطا در ارتباط با سرور', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return {
    setting,
    loading,
    editing,
    saving,
    form,
    setForm,
    setEditing,
    fetchSettings,
    saveSettings,
  }
}