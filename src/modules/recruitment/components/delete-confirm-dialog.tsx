// src/modules/recruitment/components/DeleteConfirmDialog.tsx
'use client'

import { AlertTriangle, Trash2 } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'

interface Recruitment {
  id: string
  title: string
  department: string | null
  position: string | null
  status: string
  applicants: number
  createdAt: string
  updatedAt: string
}

export function DeleteConfirmDialog({
  open, onClose, onConfirm, item,
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  item: Recruitment | null
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            تایید حذف
          </DialogTitle>
          <DialogDescription>
            این عمل قابل بازگشت نیست.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm">
              آیا از حذف موقعیت شغلی
              <span className="font-bold mx-1">&laquo;{item?.title}&raquo;</span>
              اطمینان دارید؟
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              پس از حذف، تمام اطلاعات مربوط به این موقعیت به صورت دائمی پاک خواهد شد.
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button variant="destructive" onClick={onConfirm} className="gap-2">
            <Trash2 className="w-4 h-4" />
            حذف
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}