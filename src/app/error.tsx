'use client'

import { Button } from '@/core/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">خطای غیرمنتظره</h2>
          <p className="text-sm text-muted-foreground mt-2">
            خطایی در پردازش درخواست رخ داده است. لطفاً دوباره تلاش کنید.
          </p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="outline">تلاش مجدد</Button>
          <Button onClick={() => window.location.href = '/'}>بازگشت به داشبورد</Button>
        </div>
      </div>
    </div>
  )
}
