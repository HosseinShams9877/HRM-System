// src/modules/payroll/components/PaySlipFormDialog/use-work-record.ts

import { useEffect } from 'react'

interface UseWorkRecordProps {
  employeeId: string
  year: number
  month: number
  onWorkDaysLoaded: (days: string) => void
  onOvertimeLoaded: (hours: string) => void
}

export function useWorkRecord({
  employeeId,
  year,
  month,
  onWorkDaysLoaded,
  onOvertimeLoaded,
}: UseWorkRecordProps) {
  useEffect(() => {
    if (!employeeId || !year || !month) return

    const loadWorkRecord = async () => {
      try {
        const res = await fetch(
          `/api/payroll/work-records?employeeId=${employeeId}&year=${year}&month=${month}`
        )
        if (res.ok) {
          const json = await res.json()
          const record = json.records?.[0]
          if (record) {
            onWorkDaysLoaded(String(record.workDays || 30))
            onOvertimeLoaded(String(record.overtimeHours || 0))
          }
        }
      } catch {
        // خطا را نادیده بگیرید
      }
    }

    loadWorkRecord()
  }, [employeeId, year, month, onWorkDaysLoaded, onOvertimeLoaded])
}