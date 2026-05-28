'use client'

import { BookOpen } from 'lucide-react'
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
import type { Regulation } from '../index'

// ============================================
// Regulation Form Dialog Props & Component
// ============================================

export interface RegulationFormDialogProps {
  open: boolean
  editingReg: Regulation | null
  regForm: {
    title: string
    content: string
    category: string
    version: string
    filePath: string
    isActive: boolean
    publishDate: string
  }
  saving: boolean
  onFormChange: (form: RegulationFormDialogProps['regForm']) => void
  onSave: () => void
  onClose: () => void
}

export function RegulationFormDialog({
  open,
  editingReg,
  regForm,
  saving,
  onFormChange,
  onSave,
  onClose,
}: RegulationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="w-4 h-4 text-violet-600" />
            {editingReg ? 'ویرایش آیین‌نامه' : 'افزودن آیین‌نامه جدید'}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {editingReg ? 'اطلاعات آیین‌نامه را ویرایش کنید' : 'آیین‌نامه جدید را وارد کنید'}
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
                  value={regForm.title}
                  onChange={e => onFormChange({ ...regForm, title: e.target.value })}
                  placeholder="عنوان آیین‌نامه را وارد کنید"
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block">متن آیین‌نامه *</Label>
                <Textarea
                  value={regForm.content}
                  onChange={e => onFormChange({ ...regForm, content: e.target.value })}
                  placeholder="متن کامل آیین‌نامه..."
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
                  <Label className="text-xs font-medium mb-1.5 block">دسته‌بندی *</Label>
                  <Select value={regForm.category} onValueChange={v => onFormChange({ ...regForm, category: v })}>
                    <SelectTrigger className="text-xs w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="استخدام" className="text-xs">استخدام</SelectItem>
                      <SelectItem value="حقوق" className="text-xs">حقوق</SelectItem>
                      <SelectItem value="حضورغیاب" className="text-xs">حضور و غیاب</SelectItem>
                      <SelectItem value="آموزش" className="text-xs">آموزش</SelectItem>
                      <SelectItem value="ایمنی" className="text-xs">ایمنی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium mb-1.5 block">نسخه</Label>
                  <Input
                    value={regForm.version}
                    onChange={e => onFormChange({ ...regForm, version: e.target.value })}
                    placeholder="1.0"
                    className="text-xs"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Dates & Files */}
          <div>
            <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">تاریخ و پیوست</Label>
            <Separator className="mb-3" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium mb-1.5 block">تاریخ انتشار *</Label>
                <Input
                  value={regForm.publishDate}
                  onChange={e => onFormChange({ ...regForm, publishDate: e.target.value })}
                  placeholder="مثلاً 1404/01/15"
                  className="text-xs"
                  dir="ltr"
                />
              </div>
              <div>
                <Label className="text-xs font-medium mb-1.5 block">فایل پیوست</Label>
                <Input
                  value={regForm.filePath}
                  onChange={e => onFormChange({ ...regForm, filePath: e.target.value })}
                  placeholder="مسیر فایل (اختیاری)"
                  className="text-xs"
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
                <Label htmlFor="reg-active" className="text-xs font-medium cursor-pointer">وضعیت فعال</Label>
                <Badge variant={regForm.isActive ? 'default' : 'secondary'} className="text-[10px] h-4">
                  {regForm.isActive ? 'فعال' : 'غیرفعال'}
                </Badge>
              </div>
              <Switch
                id="reg-active"
                checked={regForm.isActive}
                onCheckedChange={v => onFormChange({ ...regForm, isActive: v })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            انصراف
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving || !regForm.title || !regForm.content} className="text-xs">
            {saving ? 'در حال ذخیره...' : editingReg ? 'به‌روزرسانی' : 'ذخیره آیین‌نامه'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
