// src/modules/orders/components/OrderDialogs/delete-order-dialog.tsx
'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/core/components/ui/alert-dialog'

interface DeleteOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  submitting: boolean
}

export function DeleteOrderDialog({ open, onOpenChange, onConfirm, submitting }: DeleteOrderDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>آیا از حذف این حکم اطمینان دارید؟</AlertDialogTitle>
          <AlertDialogDescription>
            این اقدام غیرقابل بازگشت است و حکم به طور کامل حذف خواهد شد.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>انصراف</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-rose-500 hover:bg-rose-600" disabled={submitting}>
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}