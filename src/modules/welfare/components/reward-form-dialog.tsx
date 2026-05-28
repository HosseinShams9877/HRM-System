'use client'

import { Award } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/core/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Separator } from '@/core/components/ui/separator'
import { REWARD_TYPES, REWARD_TYPE_CONFIG } from '../constants'
import type { Employee, Reward } from '../index'

// ============================================
// Reward Form Dialog — پاداش
// ============================================

interface RewardFormDialogProps {
  open: boolean
  editingReward: Reward | null
  rewardForm: { employeeId: string; type: string; title: string; amount: number; reason: string; date: string }
  employees: Employee[]
  saving: boolean
  onFormChange: (form: { employeeId: string; type: string; title: string; amount: number; reason: string; date: string }) => void
  onSave: () => void
  onClose: () => void
}

export function RewardFormDialog({
  open,
  editingReward,
  rewardForm,
  employees,
  saving,
  onFormChange,
  onSave,
  onClose,
}: RewardFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-pink-600" />
            {editingReward ? 'ویرایش پاداش' : 'پاداش جدید'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Employee Selection */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">کارمند *</label>
            <Select
              value={rewardForm.employeeId}
              onValueChange={(val) => onFormChange({ ...rewardForm, employeeId: val })}
            >
              <SelectTrigger className="w-full text-xs h-9">
                <SelectValue placeholder="انتخاب کارمند" />
              </SelectTrigger>
              <SelectContent>
                {employees.map(e => (
                  <SelectItem key={e.id} value={e.id} className="text-xs">
                    {e.firstName} {e.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Type & Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">نوع پاداش *</label>
              <Select
                value={rewardForm.type}
                onValueChange={(val) => onFormChange({ ...rewardForm, type: val })}
              >
                <SelectTrigger className="w-full text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REWARD_TYPES.map(t => (
                    <SelectItem key={t} value={t} className="text-xs">
                      {REWARD_TYPE_CONFIG[t].icon} {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">مبلغ (تومان)</label>
              <Input
                type="number"
                value={rewardForm.amount || ''}
                onChange={e => onFormChange({ ...rewardForm, amount: +e.target.value })}
                className="text-xs"
                placeholder="۰"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">عنوان پاداش *</label>
            <Input
              value={rewardForm.title}
              onChange={e => onFormChange({ ...rewardForm, title: e.target.value })}
              className="text-xs"
              placeholder="مثلاً: پاداش عملکرد ماهانه"
            />
          </div>

          {/* Reason */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">دلیل</label>
            <Input
              value={rewardForm.reason}
              onChange={e => onFormChange({ ...rewardForm, reason: e.target.value })}
              className="text-xs"
              placeholder="دلیل اعطای پاداش (اختیاری)"
            />
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-medium mb-1.5 block">تاریخ *</label>
            <Input
              value={rewardForm.date}
              onChange={e => onFormChange({ ...rewardForm, date: e.target.value })}
              placeholder="1404/01/15"
              className="text-xs"
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">انصراف</Button>
          <Button size="sm" onClick={onSave} disabled={saving} className="text-xs">
            {saving ? 'ذخیره...' : editingReward ? 'بروزرسانی' : 'ذخیره'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
