// src/modules/training/components/my-trainings-module/index.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import {
  BookOpen,
  Clock,
  Calendar,
  Users,
  ChevronLeft,
  Loader2,
  Award,
  MapPin,
  Search,
  X
} from 'lucide-react'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import { useRouter } from 'next/navigation'
import { STATUS_MAP, PARTICIPANT_STATUS_MAP, CATEGORY_MAP } from '../constants'

interface Training {
  id: string
  title: string
  instructor: string | null
  startDate: string | null
  endDate: string | null
  location: string | null
  status: string
  description: string | null
  capacity: number | null
  category: string | null
  duration: number | null
  maxScore: number | null
  participants: any[]
}

interface Participant {
  id: string
  trainingId: string
  employeeId: string
  status: string
  score: number | null
  training: Training
}

interface MyTrainingsModuleProps {
  onNavigate?: (id: string) => void
}

export function MyTrainingsModule({ onNavigate }: MyTrainingsModuleProps) {
  const router = useRouter()
  const [trainings, setTrainings] = useState<Training[]>([])
  const [filteredTrainings, setFilteredTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchMyTrainings()
  }, [])

  useEffect(() => {
    filterTrainings()
  }, [trainings, searchTerm, statusFilter, categoryFilter])

  const fetchMyTrainings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/training/my-courses')
      
      if (!response.ok) {
        throw new Error('خطا در دریافت دوره‌ها')
      }

      const data = await response.json()
      
      const trainingList = data.map((p: Participant) => ({
        ...p.training,
        participantStatus: p.status,
        participantScore: p.score,
        participantId: p.id
      }))
      
      setTrainings(trainingList)
      setFilteredTrainings(trainingList)
    } catch (error) {
      console.error('Error fetching my trainings:', error)
      setError('خطا در دریافت لیست دوره‌ها')
    } finally {
      setLoading(false)
    }
  }

  const filterTrainings = () => {
    let filtered = [...trainings]

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.participantStatus === statusFilter)
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter)
    }

    setFilteredTrainings(filtered)
  }

  const getStatusBadge = (status: string) => {
    const info = STATUS_MAP[status]
    if (!info) return <Badge variant="default">{status}</Badge>
    return <Badge className={info.color}>{info.label}</Badge>
  }

  const getParticipantStatusBadge = (status: string) => {
    const info = PARTICIPANT_STATUS_MAP[status]
    if (!info) return <Badge variant="default">{status}</Badge>
    return <Badge className={info.color}>{info.label}</Badge>
  }

  const getCategoryLabel = (category: string | null) => {
    if (!category) return null
    const info = CATEGORY_MAP[category]
    return info?.label || category
  }

  const getUniqueCategories = () => {
    const categories = trainings.map(t => t.category).filter(Boolean)
    return [...new Set(categories)]
  }

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('dashboard')
    } else {
      router.push('/dashboard')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setCategoryFilter('all')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <Button variant="outline" className="mt-3" onClick={fetchMyTrainings}>
          تلاش مجدد
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* هدر */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            دوره‌های من
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {toPersianDigits(filteredTrainings.length)} دوره از {toPersianDigits(trainings.length)} دوره
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleBack}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          بازگشت به داشبورد
        </Button>
      </div>

      {/* فیلترها */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="جستجوی دوره..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            <SelectItem value="registered">ثبت‌نام</SelectItem>
            <SelectItem value="attending">در حال شرکت</SelectItem>
            <SelectItem value="completed">تکمیل</SelectItem>
            <SelectItem value="absent">عدم حضور</SelectItem>
          </SelectContent>
        </Select>

        {getUniqueCategories().length > 0 && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="دسته‌بندی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه دسته‌ها</SelectItem>
              {getUniqueCategories().map((cat) => {
                const label = getCategoryLabel(cat)
                return (
                  <SelectItem key={cat} value={cat!}>
                    {label || cat}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        )}

        {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-1"
          >
            <X className="w-4 h-4" />
            پاک کردن
          </Button>
        )}
      </div>

      {/* لیست دوره‌ها */}
      {filteredTrainings.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {trainings.length === 0 ? 'شما در هیچ دوره‌ای ثبت‌نام نکرده‌اید' : 'دوره‌ای با این فیلترها یافت نشد'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              {trainings.length === 0 ? 'برای شروع، در یک دوره آموزشی ثبت‌نام کنید' : 'فیلترهای خود را تغییر دهید'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTrainings.map((training) => (
            <Card 
              key={training.id} 
              className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
            >
              <CardHeader className="pb-2 pt-4 px-5">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-bold text-gray-800 dark:text-gray-100 line-clamp-2 flex-1">
                    {training.title}
                  </CardTitle>
                  {getStatusBadge(training.status)}
                </div>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <div className="space-y-2 text-sm">
                  {training.instructor && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{training.instructor}</span>
                    </div>
                  )}
                  {training.duration && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{toPersianDigits(training.duration)} ساعت</span>
                    </div>
                  )}
                  {training.category && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <BookOpen className="w-4 h-4" />
                      <span>{getCategoryLabel(training.category)}</span>
                    </div>
                  )}
                  {training.location && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{training.location}</span>
                    </div>
                  )}
                  {training.startDate && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {training.startDate}
                        {training.endDate && ` - ${training.endDate}`}
                      </span>
                    </div>
                  )}
                  
                  {/* وضعیت ثبت‌نام کاربر */}
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">وضعیت من:</span>
                      {getParticipantStatusBadge((training as any).participantStatus)}
                    </div>
                    {(training as any).participantScore !== null && (training as any).participantScore !== undefined && (
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-gray-500">امتیاز:</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {toPersianDigits((training as any).participantScore)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}