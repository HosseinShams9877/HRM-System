'use client'

import { useState, useMemo } from 'react'
import { Award, Banknote, TrendingUp, Edit2, Trash2, LayoutGrid, List, ChevronRight, ChevronLeft } from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table'
import { Separator } from '@/core/components/ui/separator'
import { Skeleton } from '@/core/components/ui/skeleton'
import { toPersianDigits, formatCurrency, formatShamsi } from '@/core/lib/utils-fa'
import { REWARD_TYPES, REWARD_TYPE_CONFIG } from '../index'
import type { Reward } from '../index'

// ============================================
// Rewards Tab — پاداش
// ============================================

interface RewardsTabProps {
  filteredRewards: Reward[]
  loading: boolean
  rewardTypeFilter: string
  viewMode: 'card' | 'table'
  onEdit: (item: Reward) => void
  onDelete: (id: string) => void
  onTypeFilterChange: (type: string) => void
  onViewModeChange: (mode: 'card' | 'table') => void
  rewardSummary: { total: number; cash: number; nonCash: number; totalAmount: number }
}

export function RewardsTab({
  filteredRewards,
  loading,
  rewardTypeFilter,
  viewMode,
  onEdit,
  onDelete,
  onTypeFilterChange,
  onViewModeChange,
  rewardSummary,
}: RewardsTabProps) {
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 7

  const totalItems = filteredRewards.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  const paginatedRewards = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredRewards.slice(startIndex, endIndex)
  }, [filteredRewards, currentPage, itemsPerPage])

  // وقتی فیلتر تغییر میکنه، به صفحه اول برو
  useMemo(() => {
    setCurrentPage(1)
  }, [rewardTypeFilter])

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
              <Award className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">کل پاداش‌ها</p>
              <p className="text-sm font-bold">{toPersianDigits(rewardSummary.total)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Banknote className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">نقدی</p>
              <p className="text-sm font-bold">{toPersianDigits(rewardSummary.cash)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">غیرنقدی</p>
              <p className="text-sm font-bold">{toPersianDigits(rewardSummary.nonCash)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">مجموع مبالغ</p>
              <p className="text-sm font-bold">{formatCurrency(rewardSummary.totalAmount)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">نوع:</span>
          {['همه', ...REWARD_TYPES].map(t => (
            <Button
              key={t}
              variant={rewardTypeFilter === t ? 'default' : 'outline'}
              size="sm"
              className="h-7 text-[11px] px-2.5"
              onClick={() => {
                onTypeFilterChange(t)
                setCurrentPage(1)
              }}
            >
              {t}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-md p-0.5">
          <Button
            variant={viewMode === 'card' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onViewModeChange('card')}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onViewModeChange('table')}
          >
            <List className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Rewards Content */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({length: 3}).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Award className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">پاداشی ثبت نشده</p>
          <p className="text-xs mt-1">پاداش و تشویق جدید از دکمه «پاداش جدید» ایجاد کنید</p>
        </div>
      ) : viewMode === 'card' ? (
        <>
          {/* Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedRewards.map(item => {
              const typeConf = REWARD_TYPE_CONFIG[item.type] || REWARD_TYPE_CONFIG['نقدی']
              return (
                <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-all group">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-sm">
                          {typeConf.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.employee?.firstName} {item.employee?.lastName}</p>
                          <p className="text-[10px] text-muted-foreground">{item.title}</p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] ${typeConf.color}`}>{typeConf.label}</Badge>
                    </div>
                    {item.amount ? (
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                        {formatCurrency(item.amount)}
                      </p>
                    ) : (
                      <p className="text-xs text-muted-foreground mb-2">بدون مبلغ</p>
                    )}
                    {item.reason && (
                      <p className="text-[11px] text-muted-foreground mb-2 line-clamp-1">{item.reason}</p>
                    )}
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{formatShamsi(item.date)}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onEdit(item)}
                        >
                          <Edit2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => onDelete(item.id)}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination - Card View */}
          {totalItems > itemsPerPage && (
            <div className="flex items-center justify-center gap-4 px-2 py-3">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className={`h-8 w-8 p-0 text-sm ${
                          currentPage === pageNum 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        {toPersianDigits(pageNum)}
                      </Button>
                    )
                  }).reverse()}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                نمایش {toPersianDigits(paginatedRewards.length)} از {toPersianDigits(totalItems)} پاداش
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Table View */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="max-h-[500px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">اقدامات</TableHead>
                      <TableHead className="text-xs">تاریخ</TableHead>
                      <TableHead className="text-xs">دلیل</TableHead>
                      <TableHead className="text-xs">مبلغ</TableHead>
                      <TableHead className="text-xs">عنوان</TableHead>
                      <TableHead className="text-xs">نوع</TableHead>
                      <TableHead className="text-xs">کارمند</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRewards.map(item => {
                      const typeConf = REWARD_TYPE_CONFIG[item.type] || REWARD_TYPE_CONFIG['نقدی']
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(item)}>
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost" size="sm" className="h-7 w-7 p-0"
                                onClick={() => onDelete(item.id)}
                              >
                                <Trash2 className="w-3 h-3 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatShamsi(item.date)}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                            {item.reason || '—'}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            {item.amount ? formatCurrency(item.amount) : '—'}
                          </TableCell>
                          <TableCell className="text-xs">{item.title}</TableCell>
                          <TableCell>
                            <Badge className={`text-[10px] ${typeConf.color}`}>{typeConf.label}</Badge>
                          </TableCell>
                          <TableCell className="text-xs font-medium">
                            {item.employee?.firstName} {item.employee?.lastName}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Pagination - Table View */}
          {totalItems > itemsPerPage && (
            <div className="flex items-center justify-center gap-4 px-2 py-3">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => goToPage(pageNum)}
                        className={`h-8 w-8 p-0 text-sm ${
                          currentPage === pageNum 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                          : 'dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                      >
                        {toPersianDigits(pageNum)}
                      </Button>
                    )
                  }).reverse()}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-8 w-8 p-0 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                نمایش {toPersianDigits(paginatedRewards.length)} از {toPersianDigits(totalItems)} پاداش
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}