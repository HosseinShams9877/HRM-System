// ============================================
// Types — Settings Module
// ============================================

export interface Department {
  id: string
  name: string
  code: string
  managerId: string | null
  parentId?: string | null
  parent?: { id: string; name: string } | null
  children?: { id: string; name: string; code: string }[]
  positions?: { id: string; title: string }[]
  createdAt: string
  updatedAt: string
}

export interface Holiday {
  id: string
  title: string
  date: string
  type: string // official, agreed, occasional
  isRecurring: boolean
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface HolidayStats {
  total: number
  official: number
  agreed: number
  occasional: number
}

export interface GeneralSettings {
  organizationName: string
  fiscalYearStart: string
  workHoursStart: string
  workHoursEnd: string
  gracePeriod: string
}
