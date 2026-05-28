'use client'

import {
  LogOut, Edit2, User, Eye, Sparkles, FileText
} from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/core/components/ui/dialog'
import { Progress } from '@/core/components/ui/progress'
import { Checkbox } from '@/core/components/ui/checkbox'
import { Separator } from '@/core/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { ScrollArea } from '@/core/components/ui/scroll-area'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { OffboardItem } from '../index'
import { REASONS, OFFBOARDING_TEMPLATES, REASON_COLORS } from '../constants'
import { parseTasks, calcProgress, tasksToString, statusLabel, statusBadgeVariant } from '../lib/utils'

interface OffboardingDialogsProps {
  // Create dialog
  showOffDialog: boolean
  setShowOffDialog: (v: boolean) => void
  offForm: { employeeId: string; reason: string; lastDate: string; tasks: string; template: string }
  setOffForm: (v: { employeeId: string; reason: string; lastDate: string; tasks: string; template: string }) => void
  employees: { id: string; firstName: string; lastName: string }[]
  saving: boolean
  saveOffboard: () => void
  applyOffTemplate: (template: string) => void

  // Edit dialog
  showOffEditDialog: boolean
  setShowOffEditDialog: (v: boolean) => void
  editOffForm: OffboardItem | null
  setEditOffForm: (v: OffboardItem | null) => void
  saveEditOffboard: () => void

  // Detail dialog
  showOffDetailDialog: boolean
  setShowOffDetailDialog: (v: boolean) => void
  detailOffItem: OffboardItem | null
  offboards: OffboardItem[]
  onToggleTask: (type: 'on' | 'off', id: string, taskIndex: number) => void
  setOffboards: React.Dispatch<React.SetStateAction<OffboardItem[]>>
}

export function OffboardingDialogs({
  showOffDialog, setShowOffDialog, offForm, setOffForm, employees, saving, saveOffboard, applyOffTemplate,
  showOffEditDialog, setShowOffEditDialog, editOffForm, setEditOffForm, saveEditOffboard,
  showOffDetailDialog, setShowOffDetailDialog, detailOffItem, offboards, onToggleTask, setOffboards
}: OffboardingDialogsProps) {
  return (
    <>
      {/* Create Offboarding Dialog */}
      <Dialog open={showOffDialog} onOpenChange={setShowOffDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-600" />
              آفبوردینگ جدید
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {/* Employee */}
            <div>
              <label className="text-xs font-medium mb-1 block">کارمند *</label>
              <Select value={offForm.employeeId} onValueChange={v => setOffForm({ ...offForm, employeeId: v })}>
                <SelectTrigger className="w-full text-xs h-9">
                  <SelectValue placeholder="انتخاب کارمند" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.firstName} {e.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Reason & Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">دلیل *</label>
                <Select value={offForm.reason} onValueChange={v => setOffForm({ ...offForm, reason: v })}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REASONS.map(r => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">آخرین روز</label>
                <Input
                  value={offForm.lastDate}
                  onChange={e => setOffForm({ ...offForm, lastDate: e.target.value })}
                  placeholder="1404/01/15"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Template selector */}
            <div>
              <label className="text-xs font-medium mb-1 block">الگوی وظایف</label>
              <div className="flex items-center gap-2">
                <Select value={offForm.template} onValueChange={v => { setOffForm({ ...offForm, template: v }); applyOffTemplate(v) }}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(OFFBOARDING_TEMPLATES).map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 text-xs shrink-0"
                  onClick={() => applyOffTemplate(offForm.template)}
                >
                  <Sparkles className="w-3 h-3" />
                  اعمال
                </Button>
              </div>
            </div>

            {/* Tasks */}
            <div>
              <label className="text-xs font-medium mb-1 block">وظایف (هر خط یک وظیفه)</label>
              <textarea
                value={offForm.tasks}
                onChange={e => setOffForm({ ...offForm, tasks: e.target.value })}
                className="w-full min-h-[100px] text-xs rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={"تحویل تجهیزات\nپاکسازی حساب کاربری\nتسویه حساب"}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowOffDialog(false)} className="text-xs">انصراف</Button>
            <Button size="sm" onClick={saveOffboard} disabled={saving || !offForm.employeeId} className="text-xs">
              {saving ? 'ذخیره...' : 'ذخیره'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Offboarding Dialog */}
      <Dialog open={showOffEditDialog} onOpenChange={setShowOffEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-rose-600" />
              ویرایش آفبوردینگ
            </DialogTitle>
          </DialogHeader>
          {editOffForm && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-rose-600" />
                </div>
                <p className="text-sm font-medium">{editOffForm.employee?.firstName} {editOffForm.employee?.lastName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">دلیل</label>
                  <Select value={editOffForm.reason} onValueChange={v => setEditOffForm({ ...editOffForm, reason: v })}>
                    <SelectTrigger className="w-full text-xs h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {REASONS.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">آخرین روز</label>
                  <Input
                    value={editOffForm.lastDate || ''}
                    onChange={e => setEditOffForm({ ...editOffForm, lastDate: e.target.value })}
                    placeholder="1404/01/15"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowOffEditDialog(false)} className="text-xs">انصراف</Button>
            <Button size="sm" onClick={saveEditOffboard} disabled={saving} className="text-xs">
              {saving ? 'ذخیره...' : 'ذخیره'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Offboarding Dialog */}
      <Dialog open={showOffDetailDialog} onOpenChange={setShowOffDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-rose-600" />
              جزئیات آفبوردینگ
            </DialogTitle>
          </DialogHeader>
          {detailOffItem && (() => {
            const updatedItem = offboards.find(i => i.id === detailOffItem.id) || detailOffItem
            const updatedTasks = parseTasks(updatedItem.tasks)
            const updatedDone = updatedTasks.filter(t => t.done).length

            return (
              <div className="space-y-4 py-2">
                {/* Employee Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20">
                  <div className="w-10 h-10 rounded-full bg-rose-200 dark:bg-rose-800/40 flex items-center justify-center">
                    <User className="w-5 h-5 text-rose-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{updatedItem.employee?.firstName} {updatedItem.employee?.lastName}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                      <Badge className={`text-[10px] ${REASON_COLORS[updatedItem.reason] || ''}`}>{updatedItem.reason}</Badge>
                      {updatedItem.lastDate && <span>آخرین روز: {updatedItem.lastDate}</span>}
                    </div>
                  </div>
                  <Badge variant={statusBadgeVariant(updatedItem.status)} className="text-[10px] mr-auto">
                    {statusLabel(updatedItem.status)}
                  </Badge>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">پیشرفت کلی</span>
                    <span className="text-xs font-bold">{toPersianDigits(updatedItem.progress)}٪</span>
                  </div>
                  <Progress value={updatedItem.progress} className="h-3" />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{toPersianDigits(updatedDone)} از {toPersianDigits(updatedTasks.length)} وظیفه تکمیل شده</span>
                  </div>
                </div>

                <Separator />

                {/* Interactive Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-medium flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" />
                      فهرست وظایف
                    </h4>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={async () => {
                          const newTasks = updatedTasks.map(t => ({ ...t, done: true }))
                          const newProgress = calcProgress(newTasks)
                          const newStatus = newProgress === 100 ? 'completed' : updatedItem.status
                          const newTasksStr = tasksToString(newTasks)
                          setOffboards(prev => prev.map(i => i.id === updatedItem.id ? { ...i, tasks: newTasksStr, progress: newProgress, status: newStatus } : i))
                          try {
                            await fetch(`/api/offboarding/${updatedItem.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ tasks: newTasksStr, progress: newProgress, status: newStatus })
                            })
                          } catch (e) { console.error(e) }
                        }}
                      >
                        تکمیل همه
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] px-2"
                        onClick={async () => {
                          const newTasks = updatedTasks.map(t => ({ ...t, done: false }))
                          const newTasksStr = tasksToString(newTasks)
                          setOffboards(prev => prev.map(i => i.id === updatedItem.id ? { ...i, tasks: newTasksStr, progress: 0, status: 'in_progress' } : i))
                          try {
                            await fetch(`/api/offboarding/${updatedItem.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ tasks: newTasksStr, progress: 0, status: 'in_progress' })
                            })
                          } catch (e) { console.error(e) }
                        }}
                      >
                        بازنشانی
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="max-h-60">
                    <div className="space-y-2">
                      {updatedTasks.map((task, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors">
                          <Checkbox
                            checked={task.done}
                            onCheckedChange={() => onToggleTask('off', updatedItem.id, idx)}
                            className="size-4"
                          />
                          <span className={`text-xs ${task.done ? 'line-through text-muted-foreground' : ''}`}>
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )
          })()}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowOffDetailDialog(false)} className="text-xs">بستن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
