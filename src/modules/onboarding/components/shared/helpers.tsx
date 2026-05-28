'use client'

import React from 'react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Progress } from '@/core/components/ui/progress'
import { Checkbox } from '@/core/components/ui/checkbox'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { parseTasks } from '../../lib/utils'

// ============================================
// Shared Render Helpers
// ============================================

export function renderSummaryCard(title: string, value: number | string, icon: React.ReactNode, color: string) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
          <div>
            <p className="text-[11px] text-muted-foreground">{title}</p>
            <p className="text-lg font-bold">{toPersianDigits(value)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function renderProgressBar(progress: number) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">پیشرفت</span>
        <span className="text-[10px] font-medium">{toPersianDigits(progress)}٪</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}

export function renderTaskChecklist(
  type: 'on' | 'off',
  id: string,
  tasksStr: string | null,
  onToggleTask: (type: 'on' | 'off', id: string, taskIndex: number) => void,
  compact = false
) {
  const tasks = parseTasks(tasksStr)
  if (tasks.length === 0) {
    return <p className="text-[11px] text-muted-foreground italic">وظیفه‌ای تعریف نشده</p>
  }

  return (
    <div className={`space-y-1.5 ${compact ? 'max-h-40 overflow-y-auto' : ''}`}>
      {tasks.map((task, idx) => (
        <div key={idx} className="flex items-center gap-2 group">
          <Checkbox
            checked={task.done}
            onCheckedChange={() => onToggleTask(type, id, idx)}
            className="size-4"
          />
          <span className={`text-xs leading-relaxed ${task.done ? 'line-through text-muted-foreground' : ''}`}>
            {task.text}
          </span>
        </div>
      ))}
    </div>
  )
}
