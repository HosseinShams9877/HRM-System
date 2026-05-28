import { TaskItem } from '../types/types'

// ============================================
// Helpers
// ============================================

export function parseTasks(tasks: string | null): TaskItem[] {
  if (!tasks) return []
  try {
    const parsed = JSON.parse(tasks)
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return []
      if (typeof parsed[0] === 'string') {
        return parsed.map((t: string) => ({ text: t, done: false }))
      }
      return parsed as TaskItem[]
    }
    return []
  } catch {
    return tasks.split('\n').filter(Boolean).map(t => ({ text: t.trim(), done: false }))
  }
}

export function tasksToString(tasks: TaskItem[]): string {
  return JSON.stringify(tasks)
}

export function calcProgress(tasks: TaskItem[]): number {
  if (tasks.length === 0) return 0
  const done = tasks.filter(t => t.done).length
  return Math.round((done / tasks.length) * 100)
}

export function statusLabel(status: string): string {
  return status === 'completed' ? 'تکمیل شده' : 'در حال انجام'
}

export function statusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  return status === 'completed' ? 'default' : 'secondary'
}
