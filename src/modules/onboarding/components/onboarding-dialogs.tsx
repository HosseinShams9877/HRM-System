'use client'

import {
  PlaneTakeoff, Edit2, User, Eye, AlertCircle, Sparkles, FileText
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
import { OnboardItem, TaskItem } from '../types/types'
import { ONBOARDING_TEMPLATES } from '../constants'
import { parseTasks, calcProgress, tasksToString, statusLabel, statusBadgeVariant } from '../lib/utils'

interface OnboardingDialogsProps {
  // Create dialog
  showOnDialog: boolean
  setShowOnDialog: (v: boolean) => void
  onForm: { employeeId: string; startDate: string; endDate: string; tasks: string; template: string }
  setOnForm: (v: { employeeId: string; startDate: string; endDate: string; tasks: string; template: string }) => void
  employees: { id: string; firstName: string; lastName: string }[]
  saving: boolean
  saveOnboard: () => void
  applyOnTemplate: (template: string) => void

  // Edit dialog
  showOnEditDialog: boolean
  setShowOnEditDialog: (v: boolean) => void
  editOnForm: OnboardItem | null
  setEditOnForm: (v: OnboardItem | null) => void
  saveEditOnboard: () => void

  // Detail dialog
  showOnDetailDialog: boolean
  setShowOnDetailDialog: (v: boolean) => void
  detailOnItem: OnboardItem | null
  onboards: OnboardItem[]
  onToggleTask: (type: 'on' | 'off', id: string, taskIndex: number) => void
  setOnboards: React.Dispatch<React.SetStateAction<OnboardItem[]>>

  // Delete dialog
  deleteTarget: { type: 'on' | 'off'; id: string } | null
  setDeleteTarget: (v: { type: 'on' | 'off'; id: string } | null) => void
  handleDelete: () => void
}

export function OnboardingDialogs({
  showOnDialog, setShowOnDialog, onForm, setOnForm, employees, saving, saveOnboard, applyOnTemplate,
  showOnEditDialog, setShowOnEditDialog, editOnForm, setEditOnForm, saveEditOnboard,
  showOnDetailDialog, setShowOnDetailDialog, detailOnItem, onboards, onToggleTask, setOnboards,
  deleteTarget, setDeleteTarget, handleDelete
}: OnboardingDialogsProps) {
  return (
    <>
      {/* Create Onboarding Dialog */}
      <Dialog open={showOnDialog} onOpenChange={setShowOnDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <PlaneTakeoff className="w-4 h-4 text-teal-600" />
              آنبوردینگ جدید
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {/* Employee */}
            <div>
              <label className="text-xs font-medium mb-1 block">کارمند *</label>
              <Select value={onForm.employeeId} onValueChange={v => setOnForm({ ...onForm, employeeId: v })}>
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

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">تاریخ شروع</label>
                <Input
                  value={onForm.startDate}
                  onChange={e => setOnForm({ ...onForm, startDate: e.target.value })}
                  placeholder="1404/01/01"
                  className="text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">تاریخ پایان</label>
                <Input
                  value={onForm.endDate}
                  onChange={e => setOnForm({ ...onForm, endDate: e.target.value })}
                  placeholder="1404/01/15"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Template selector */}
            <div>
              <label className="text-xs font-medium mb-1 block">الگوی وظایف</label>
              <div className="flex items-center gap-2">
                <Select value={onForm.template} onValueChange={v => { setOnForm({ ...onForm, template: v }); applyOnTemplate(v) }}>
                  <SelectTrigger className="w-full text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(ONBOARDING_TEMPLATES).map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1 text-xs shrink-0"
                  onClick={() => applyOnTemplate(onForm.template)}
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
                value={onForm.tasks}
                onChange={e => setOnForm({ ...onForm, tasks: e.target.value })}
                className="w-full min-h-[100px] text-xs rounded-md border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder={"تکمیل فرم‌ها\nمعرفی به تیم\nآموزش اولیه"}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowOnDialog(false)} className="text-xs">انصراف</Button>
            <Button size="sm" onClick={saveOnboard} disabled={saving || !onForm.employeeId} className="text-xs">
              {saving ? 'ذخیره...' : 'ذخیره'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Onboarding Dialog */}
      <Dialog open={showOnEditDialog} onOpenChange={setShowOnEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-teal-600" />
              ویرایش آنبوردینگ
            </DialogTitle>
          </DialogHeader>
          {editOnForm && (
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                  <User className="w-4 h-4 text-teal-600" />
                </div>
                <p className="text-sm font-medium">{editOnForm.employee?.firstName} {editOnForm.employee?.lastName}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1 block">تاریخ شروع</label>
                  <Input
                    value={editOnForm.startDate || ''}
                    onChange={e => setEditOnForm({ ...editOnForm, startDate: e.target.value })}
                    placeholder="1404/01/01"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">تاریخ پایان</label>
                  <Input
                    value={editOnForm.endDate || ''}
                    onChange={e => setEditOnForm({ ...editOnForm, endDate: e.target.value })}
                    placeholder="1404/01/15"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowOnEditDialog(false)} className="text-xs">انصراف</Button>
            <Button size="sm" onClick={saveEditOnboard} disabled={saving} className="text-xs">
              {saving ? 'ذخیره...' : 'ذخیره'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Onboarding Dialog */}
      <Dialog open={showOnDetailDialog} onOpenChange={setShowOnDetailDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-600" />
              جزئیات آنبوردینگ
            </DialogTitle>
          </DialogHeader>
          {detailOnItem && (() => {
            const updatedItem = onboards.find(i => i.id === detailOnItem.id) || detailOnItem
            const updatedTasks = parseTasks(updatedItem.tasks)
            const updatedDone = updatedTasks.filter(t => t.done).length

            return (
              <div className="space-y-4 py-2">
                {/* Employee Info */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-teal-50 dark:bg-teal-900/20">
                  <div className="w-10 h-10 rounded-full bg-teal-200 dark:bg-teal-800/40 flex items-center justify-center">
                    <User className="w-5 h-5 text-teal-700" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{updatedItem.employee?.firstName} {updatedItem.employee?.lastName}</p>
                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                      {updatedItem.startDate && <span>شروع: {updatedItem.startDate}</span>}
                      {updatedItem.endDate && <span>پایان: {updatedItem.endDate}</span>}
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
                          setOnboards(prev => prev.map(i => i.id === updatedItem.id ? { ...i, tasks: newTasksStr, progress: newProgress, status: newStatus } : i))
                          try {
                            await fetch(`/api/onboarding/${updatedItem.id}`, {
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
                          const newProgress = 0
                          const newTasksStr = tasksToString(newTasks)
                          setOnboards(prev => prev.map(i => i.id === updatedItem.id ? { ...i, tasks: newTasksStr, progress: newProgress, status: 'in_progress' } : i))
                          try {
                            await fetch(`/api/onboarding/${updatedItem.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ tasks: newTasksStr, progress: newProgress, status: 'in_progress' })
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
                            onCheckedChange={() => onToggleTask('on', updatedItem.id, idx)}
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
            <Button variant="outline" size="sm" onClick={() => setShowOnDetailDialog(false)} className="text-xs">بستن</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              تایید حذف
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">آیا از حذف این مورد اطمینان دارید؟ این عمل قابل بازگشت نیست.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)} className="text-xs">انصراف</Button>
            <Button variant="destructive" size="sm" onClick={handleDelete} className="text-xs">حذف</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
