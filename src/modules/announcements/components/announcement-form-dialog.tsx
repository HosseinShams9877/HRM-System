'use client'

import { Megaphone } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Textarea } from '@/core/components/ui/textarea'
import { Separator } from '@/core/components/ui/separator'
import { Switch } from '@/core/components/ui/switch'
import { Label } from '@/core/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/core/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/core/components/ui/select'
import type { Announcement } from '../index'

// ============================================
// Announcement Form Dialog Props & Component
// ============================================

export interface AnnouncementFormDialogProps {
  open: boolean
  editingAnn: Announcement | null
  annForm: {
    title: string
    content: string
    priority: string
    targetAudience: string
    department: string
    isActive: boolean
    publishDate: string
    expiryDate: string
  }
  saving: boolean
  onFormChange: (form: AnnouncementFormDialogProps['annForm']) => void
  onSave: () => void
  onClose: () => void
}

export function AnnouncementFormDialog({
  open,
  editingAnn,
  annForm,
  saving,
  onFormChange,
  onSave,
  onClose,
}: AnnouncementFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Megaphone className="w-4 h-4 text-sky-600" />
            {editingAnn ? 'ویرایش اطلاعیه' : 'افزودن اطلاعیه جدید'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {editingAnn ? 'اطلاعات اطلاعیه را ویرایش کنید' : 'اطلاعیه جدید را وارد کنید'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Section: Basic Info */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">اطلاعات پایه</Label>
            <Separator className="mb-3" />
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium mb-1.5 block">عنوان *</Label>
                <Input
                  value={annForm.title}
                  onChange={e => onFormChange({ ...annForm, title: e.target.value })}
                  placeholder="عنوان اطلاعیه را وارد کنید"
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block">متن اطلاعیه *</Label>
                <Textarea
                  value={annForm.content}
                  onChange={e => onFormChange({ ...annForm, content: e.target.value })}
                  placeholder="متن کامل اطلاعیه..."
                  className="text-xs min-h-[120px] resize-y"
                />
              </div>
            </div>
          </div>

          {/* Section: Settings */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">تنظیمات</Label>
            <Separator className="mb-3" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">اولویت</Label>
                  <Select value={annForm.priority} onValueChange={v => onFormChange({ ...annForm, priority: v })}>
                    <SelectTrigger className="text-xs w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent" className="text-xs">فوری</SelectItem>
                      <SelectItem value="high" className="text-xs">مهم</SelectItem>
                      <SelectItem value="normal" className="text-xs">عادی</SelectItem>
                      <SelectItem value="low" className="text-xs">کم‌اهمیت</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">مخاطب</Label>
                  <Select value={annForm.targetAudience} onValueChange={v => onFormChange({ ...annForm, targetAudience: v })}>
                    <SelectTrigger className="text-xs w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all" className="text-xs">همه</SelectItem>
                      <SelectItem value="managers" className="text-xs">مدیران</SelectItem>
                      <SelectItem value="employees" className="text-xs">کارکنان</SelectItem>
                      <SelectItem value="department" className="text-xs">دپارتمان</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {annForm.targetAudience === 'department' && (
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">دپارتمان</Label>
                  <Input
                    value={annForm.department}
                    onChange={e => onFormChange({ ...annForm, department: e.target.value })}
                    placeholder="نام دپارتمان"
                    className="text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section: Dates */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">تاریخ</Label>
            <Separator className="mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-1.5 block">تاریخ انتشار *</Label>
                <Input
                  value={annForm.publishDate}
                  onChange={e => onFormChange({ ...annForm, publishDate: e.target.value })}
                  placeholder="مثلاً 1404/01/15"
                  className="text-xs"
                  dir="ltr"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block">تاریخ انقضا</Label>
                <Input
                  value={annForm.expiryDate}
                  onChange={e => onFormChange({ ...annForm, expiryDate: e.target.value })}
                  placeholder="اختیاری — مثلاً 1404/06/31"
                  className="text-xs"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Section: Status */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">وضعیت</Label>
            <Separator className="mb-3" />
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Label htmlFor="ann-active" className="text-xs font-medium cursor-pointer">وضعیت فعال</Label>
                <Badge variant={annForm.isActive ? 'default' : 'secondary'} className="text-[10px] h-4">
                  {annForm.isActive ? 'فعال' : 'غیرفعال'}
                </Badge>
              </div>
              <Switch
                id="ann-active"
                checked={annForm.isActive}
                onCheckedChange={v => onFormChange({ ...annForm, isActive: v })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            انصراف
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving || !annForm.title || !annForm.content} className="text-xs">
            {saving ? 'در حال ذخیره...' : editingAnn ? 'به‌روزرسانی' : 'ذخیره اطلاعیه'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
