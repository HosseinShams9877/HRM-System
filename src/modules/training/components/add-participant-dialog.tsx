'use client'

import { useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { toPersianDigits } from '@/core/lib/utils-fa'
import type { EmployeeBasic, Participant } from '../index'

// ============================================
// Add Participant Dialog
// ============================================

export interface AddParticipantDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (employeeId: string) => void
  employees: EmployeeBasic[]
  existingParticipants: Participant[]
}

export function AddParticipantDialog({
  open, onClose, onSubmit, employees, existingParticipants,
}: AddParticipantDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(() => '')
  const [empSearch, setEmpSearch] = useState(() => '')

  // Reset when dialog opens
  const prevOpen = useState(open)
  if (open !== prevOpen[0]) {
    prevOpen[1](open)
    if (open) {
      setSelectedEmployeeId('')
      setEmpSearch('')
    }
  }

  const existingIds = new Set(existingParticipants.map(p => p.employeeId))
  const availableEmployees = employees.filter(e => !existingIds.has(e.id))
  const filteredEmployees = empSearch
    ? availableEmployees.filter(e => `${e.firstName} ${e.lastName}`.includes(empSearch) || e.personnelCode.includes(empSearch))
    : availableEmployees

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-amber-600" />
            افزودن شرکت‌کننده
          </DialogTitle>
          <DialogDescription>کارمند مورد نظر را به این دوره اضافه کنید</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="جستجو نام یا کد پرسنلی..." value={empSearch} onChange={e => setEmpSearch(e.target.value)} className="pr-10" />
          </div>
          <div className="max-h-[250px] overflow-y-auto border rounded-lg">
            {filteredEmployees.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">کارمند یافت نشد</div>
            ) : (
              filteredEmployees.map(emp => (
                <button
                  key={emp.id}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${selectedEmployeeId === emp.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted/50'}`}
                  onClick={() => { setSelectedEmployeeId(emp.id); setEmpSearch('') }}
                >
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[9px] font-bold">
                      {emp.firstName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-right">
                    <span className="text-xs font-medium">{emp.firstName} {emp.lastName}</span>
                    <p className="text-[10px] text-muted-foreground">{emp.department || '—'}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{toPersianDigits(emp.personnelCode)}</Badge>
                </button>
              ))
            )}
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>انصراف</Button>
          <Button onClick={() => { if (selectedEmployeeId) onSubmit(selectedEmployeeId) }} disabled={!selectedEmployeeId} className="gap-2">
            <UserPlus className="w-4 h-4" />
            افزودن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
