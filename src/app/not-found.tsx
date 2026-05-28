'use client'

import { Button } from '@/core/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-muted flex items-center justify-center">
          <FileQuestion className="w-10 h-10 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-4xl font-bold text-foreground">۴۰۴</h1>
          <p className="text-lg text-muted-foreground mt-2">صفحه مورد نظر یافت نشد</p>
        </div>
        <Button onClick={() => window.location.href = '/'} variant="outline">
          بازگشت به داشبورد
        </Button>
      </div>
    </div>
  )
}
