'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Badge } from '@/core/components/ui/badge'
import { Separator } from '@/core/components/ui/separator'
import {
  BookOpen, Loader2, Calendar, Tag, FileText,
  ChevronDown, ChevronUp, FolderOpen
} from 'lucide-react'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  'استخدام': { label: 'استخدام', color: 'bg-sky-100 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300' },
  'حقوق': { label: 'حقوق', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300' },
  'حضورغیاب': { label: 'حضور و غیاب', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300' },
  'آموزش': { label: 'آموزش', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300' },
  'ایمنی': { label: 'ایمنی', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300' },
}

export default function RegulationsList() {
  const [loading, setLoading] = useState(true)
  const [regulations, setRegulations] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/regulations?isActive=true')
        if (res.ok) {
          const data = await res.json()
          setRegulations(Array.isArray(data) ? data : [])
        }
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-red-500" />
      </div>
    )
  }

  // Group by category
  const categories = [...new Set(regulations.map((r: any) => r.category))]
  const filteredRegulations = selectedCategory === 'all'
    ? regulations
    : regulations.filter((r: any) => r.category === selectedCategory)

  if (regulations.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 text-center">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">آیین‌نامه‌ای یافت نشد</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">دسته‌بندی</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              همه
            </button>
            {categories.map((cat: string) => {
              const catInfo = CATEGORY_MAP[cat] || { label: cat, color: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300' }
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : `${catInfo.color} hover:opacity-80`
                  }`}
                >
                  {catInfo.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Regulations List */}
      <div className="space-y-3">
        {filteredRegulations.map((reg: any) => {
          const catInfo = CATEGORY_MAP[reg.category] || { label: reg.category, color: 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-300' }
          const isExpanded = expandedId === reg.id

          return (
            <Card key={reg.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <button
                  className="w-full text-right"
                  onClick={() => setExpandedId(isExpanded ? null : reg.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 shrink-0">
                        <BookOpen className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium leading-relaxed">{reg.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`${catInfo.color} text-[10px]`}>{catInfo.label}</Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            نسخه {toPersianDigits(reg.version)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="mt-3 space-y-3">
                    <Separator />
                    <p className="text-xs leading-relaxed whitespace-pre-wrap">{reg.content}</p>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        <span>{formatShamsi(reg.publishDate)}</span>
                      </div>
                      {reg.filePath && (
                        <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                          <FileText className="w-3 h-3" />
                          <span>فایل پیوست</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
