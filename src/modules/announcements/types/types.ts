// ============================================
// Types — Announcements & Regulations Module
// ============================================

export interface Announcement {
  id: string
  title: string
  content: string
  priority: string
  targetAudience: string
  department: string | null
  isActive: boolean
  publishDate: string
  expiryDate: string | null
  createdAt: string
  updatedAt: string
}

export interface Regulation {
  id: string
  title: string
  content: string
  category: string
  version: string
  filePath: string | null
  isActive: boolean
  publishDate: string
  createdAt: string
  updatedAt: string
}

export type ViewMode = 'card' | 'table'

export interface AnnStats {
  total: number
  high: number
  normal: number
  recent: number
  active: number
}

export interface RegStats {
  total: number
  active: number
  draft: number
  revoked: number
}
