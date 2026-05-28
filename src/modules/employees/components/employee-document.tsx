// src/modules/employees/components/EmployeeDocuments.tsx
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, User, Calendar, Briefcase, FileText, Clock,
  Plus, Filter, Download, Edit, Trash2, X, Upload,
  Building2, Award, Loader2, CheckCircle, XCircle, Eye,
  MoreHorizontal, File, Image, FileArchive, AlertCircle
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Badge } from '@/core/components/ui/badge'
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/core/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/core/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/core/components/ui/tabs'
import { toast } from 'sonner'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'

// ============================================
// Types
// ============================================

interface Employee {
  id: string
  firstName: string
  lastName: string
  personnelCode: string
  position: string
  department: string
  employmentDate: string
  employmentStatus: 'active' | 'inactive' | 'probation'
  avatar?: string
}

interface Document {
  id: string
  employeeId: string
  title: string
  category: 'identification' | 'education' | 'military' | 'resume' | 'contract' | 'certificate' | 'other'
  fileName: string
  fileUrl: string
  fileSize: number
  fileType: string
  status: 'pending' | 'approved' | 'rejected'
  description?: string
  uploadedAt: string
}

interface EmployeeDocumentsProps {
  onNavigate?: (id: string) => void
  currentUser?: { role: string; employeeId?: string }
}

// ============================================
// Categories
// ============================================

const CATEGORIES = [
  { id: 'identification', label: 'مدارک شناسایی', icon: '🆔', color: 'bg-blue-100 text-blue-600' },
  { id: 'education', label: 'مدارک تحصیلی', icon: '🎓', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'military', label: 'مدارک نظام وظیفه', icon: '🪖', color: 'bg-amber-100 text-amber-600' },
  { id: 'resume', label: 'رزومه', icon: '📄', color: 'bg-purple-100 text-purple-600' },
  { id: 'contract', label: 'قراردادها', icon: '📑', color: 'bg-rose-100 text-rose-600' },
  { id: 'certificate', label: 'گواهینامه‌ها', icon: '🏆', color: 'bg-orange-100 text-orange-600' },
  { id: 'other', label: 'سایر مدارک', icon: '📁', color: 'bg-gray-100 text-gray-600' },
]

// ============================================
// Helper Functions
// ============================================

const getStatusBadge = (status: string) => {
    if (!status || status === 'null' || status === 'undefined' || status === '') {
      return { label: 'نامشخص', color: 'bg-gray-100 text-gray-500' }
    }
    
    switch (status) {
      case 'active':
      case 'فعال':
        return { label: 'فعال', color: 'bg-emerald-100 text-emerald-600' }
      case 'inactive':
      case 'غیرفعال':
        return { label: 'غیرفعال', color: 'bg-rose-100 text-rose-600' }
      case 'probation':
      case 'آزمایشی':
        return { label: 'آزمایشی', color: 'bg-amber-100 text-amber-600' }
      default:
        return { label: status || 'نامشخص', color: 'bg-gray-100 text-gray-500' }
    }
  }

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ============================================
// Main Component
// ============================================

export function EmployeeDocuments({ onNavigate, currentUser }: EmployeeDocumentsProps) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
  })

  // ============================================
  // Fetch Employees
  // ============================================

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch('/api/employees')
      if (res.ok) {
        const data = await res.json()
        const empList = data.data || data.records || data
        setEmployees(Array.isArray(empList) ? empList : [])
        setLoading(false)
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      setLoading(false)
    }
  }, [])

  // ============================================
  // Fetch Documents
  // ============================================

  const fetchDocuments = useCallback(async (employeeId: string) => {
    if (!employeeId) return
    try {
      const res = await fetch(`/api/employees/${employeeId}/documents`)
      if (res.ok) {
        const data = await res.json()
        const docs = data.data || data.records || data
        setDocuments(Array.isArray(docs) ? docs : [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  useEffect(() => {
    if (selectedEmployee) {
      fetchDocuments(selectedEmployee.id)
    }
  }, [selectedEmployee, fetchDocuments])

  // ============================================
  // Handlers
  // ============================================

  const handleEmployeeSelect = (employeeId: string) => {
    const emp = employees.find(e => e.id === employeeId)
    setSelectedEmployee(emp || null)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUploadDocument = async () => {
    if (!selectedEmployee || !selectedFile || !formData.title || !formData.category) {
      toast.error('لطفاً همه فیلدهای required را پر کنید')
      return
    }

    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)
      uploadFormData.append('title', formData.title)
      uploadFormData.append('category', formData.category)
      uploadFormData.append('description', formData.description)
      uploadFormData.append('employeeId', selectedEmployee.id)

      const res = await fetch(`/api/employees/${selectedEmployee.id}/documents`, {
        method: 'POST',
        body: uploadFormData,
      })

      if (res.ok) {
        toast.success('مدرک با موفقیت آپلود شد')
        setShowUploadDialog(false)
        setSelectedFile(null)
        setFormData({ title: '', category: '', description: '' })
        fetchDocuments(selectedEmployee.id)
      } else {
        toast.error('خطا در آپلود مدرک')
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور')
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const res = await fetch(doc.fileUrl)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast.error('خطا در دانلود فایل')
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('آیا از حذف این مدرک اطمینان دارید؟')) return

    try {
      const res = await fetch(`/api/employees/${selectedEmployee?.id}/documents/${docId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        toast.success('مدرک حذف شد')
        fetchDocuments(selectedEmployee!.id)
      } else {
        toast.error('خطا در حذف مدرک')
      }
    } catch (error) {
      toast.error('خطا در ارتباط با سرور')
    }
  }

  // فیلتر کردن کارمندان
  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.includes(searchTerm) ||
    emp.personnelCode.includes(searchTerm)
  )

  // فیلتر کردن مدارک
  const filteredDocuments = documents.filter(doc => {
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false
    if (statusFilter !== 'all' && doc.status !== statusFilter) return false
    return true
  })

  const statusBadge = selectedEmployee ? getStatusBadge(selectedEmployee.employmentStatus) : null

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen" dir="rtl">
      {/* Main Card */}
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden">
        
        {/* Header with Employee Selector */}
        <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-white">مدارک پرسنلی</h1>
              <p className="text-emerald-100 text-sm mt-1">مدیریت مدارک و مستندات کارکنان</p>
            </div>

            {/* Employee Selector */}
            <div className="w-full md:w-96">
              <Select onValueChange={handleEmployeeSelect} value={selectedEmployee?.id}>
                <SelectTrigger className="bg-white border-2 border-emerald-300 text-gray-800 font-medium shadow-md">
                  <SelectValue placeholder="🔍 انتخاب کارمند..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="p-2 sticky top-0 bg-white border-b">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="جستجو بر اساس نام یا کد پرسنلی..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pr-10"
                      />
                    </div>
                  </div>
                  {filteredEmployees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-emerald-500 text-white text-[10px]">
                              {emp.firstName[0]}{emp.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{emp.firstName} {emp.lastName}</span>
                        </div>
                        <span className="text-xs text-gray-400">{emp.personnelCode}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

      {/* Employee Info Card */}
<AnimatePresence mode="wait">
  {selectedEmployee && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-5 border-b"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 shadow-lg">
            <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-lg">
              {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {selectedEmployee.firstName} {selectedEmployee.lastName}
            </h2>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="secondary" className="gap-1">
                <FileText className="w-3 h-3" />
                {selectedEmployee.personnelCode}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Briefcase className="w-3 h-3" />
                {selectedEmployee.position}
              </Badge>
              <Badge variant="secondary" className="gap-1">
                <Building2 className="w-3 h-3" />
                {selectedEmployee.department}
              </Badge>
              <Badge className={`${statusBadge?.color} font-bold px-3 py-1`}>
                {statusBadge?.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500 text-xs">تاریخ استخدام</p>
            <p className="font-bold">{formatShamsi(selectedEmployee.employmentDate)}</p>
          </div>
        </div>

        {/* Upload Button */}
        <Button 
          onClick={() => setShowUploadDialog(true)}
          className="bg-emerald-500 hover:bg-emerald-600 gap-2"
        >
          <Upload className="w-4 h-4" />
          بارگذاری مدرک جدید
        </Button>
      </div>
      
      {/* اضافه کردن کارت وضعیت و سمت در پایین */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-gray-100">
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">سمت فعلی</p>
          <p className="text-sm font-bold text-gray-800 mt-1">{selectedEmployee.position || '—'}</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">دپارتمان</p>
          <p className="text-sm font-bold text-gray-800 mt-1">{selectedEmployee.department || '—'}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 text-center">
  <p className="text-xs text-gray-500">وضعیت همکاری</p>
  {statusBadge ? (
    <Badge className={`${statusBadge.color} mt-1 font-bold px-3 py-1`}>
      {statusBadge.label}
    </Badge>
  ) : (
    <Badge className="bg-gray-100 text-gray-500 mt-1 font-bold px-3 py-1">
      نامشخص
    </Badge>
  )}
</div>
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-3 text-center">
          <p className="text-xs text-gray-500">تعداد مدارک</p>
          <p className="text-xl font-bold text-purple-600 mt-1">{toPersianDigits(documents.length)}</p>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
        {/* Documents Section */}
        <CardContent className="p-5">
          {!selectedEmployee ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500">کارمندی را انتخاب کنید</h3>
              <p className="text-sm text-gray-400 mt-1">برای مشاهده مدارک، یک کارمند را از لیست بالا انتخاب کنید</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Filters */}
              <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {/* Category Filter */}
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px] h-9 text-sm">
                      <SelectValue placeholder="دسته بندی" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه دسته‌ها</SelectItem>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.icon} {cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] h-9 text-sm">
                      <SelectValue placeholder="وضعیت" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                      <SelectItem value="approved">تایید شده</SelectItem>
                      <SelectItem value="pending">در انتظار</SelectItem>
                      <SelectItem value="rejected">رد شده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-sm text-gray-500">
                  {toPersianDigits(filteredDocuments.length)} مدرک
                </p>
              </div>

              {/* Documents Table */}
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">هیچ مدرکی یافت نشد</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3 gap-1"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    <Upload className="w-3 h-3" />
                    بارگذاری اولین مدرک
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-3 text-gray-500 font-medium">نام مدرک</th>
                        <th className="text-right py-3 px-3 text-gray-500 font-medium">دسته بندی</th>
                        <th className="text-right py-3 px-3 text-gray-500 font-medium">تاریخ آپلود</th>
                        <th className="text-right py-3 px-3 text-gray-500 font-medium">حجم</th>
                        <th className="text-right py-3 px-3 text-gray-500 font-medium">وضعیت</th>
                        <th className="text-right py-3 px-3 text-gray-500 font-medium">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDocuments.map((doc, idx) => {
                        const category = CATEGORIES.find(c => c.id === doc.category)
                        const status = getStatusBadge(doc.status)
                        return (
                          <motion.tr
                            key={doc.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: idx * 0.03 }}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                <span className="font-medium">{doc.title}</span>
                              </div>
                              {doc.description && (
                                <p className="text-[10px] text-gray-400 mt-0.5">{doc.description}</p>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <Badge className={category?.color}>
                                {category?.icon} {category?.label}
                              </Badge>
                            </td>
                            <td className="py-3 px-3">{formatShamsi(doc.uploadedAt)}</td>
                            <td className="py-3 px-3">{formatFileSize(doc.fileSize)}</td>
                            <td className="py-3 px-3">
                              <Badge className={status.color}>{status.label}</Badge>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-blue-600"
                                  onClick={() => handleDownloadDocument(doc)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                      <MoreHorizontal className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="text-amber-600" onClick={() => {
                                      // ویرایش مدارک - می‌تونی بعداً اضافه کنی
                                      toast.info('در حال توسعه')
                                    }}>
                                      <Edit className="w-3 h-3 ml-2" />
                                      ویرایش
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-rose-600" onClick={() => handleDeleteDocument(doc.id)}>
                                      <Trash2 className="w-3 h-3 ml-2" />
                                      حذف
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </td>
                          </motion.tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>بارگذاری مدرک جدید</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>فایل *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.png"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'برای انتخاب فایل کلیک کنید'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, JPG, PNG (حداکثر 5MB)</p>
                </label>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label>عنوان مدرک *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: مدرک تحصیلی کارشناسی"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>دسته بندی *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته بندی..." />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>توضیحات</Label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-lg min-h-[80px]"
                placeholder="توضیحات اضافی..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUploadDialog(false)
              setSelectedFile(null)
              setFormData({ title: '', category: '', description: '' })
            }}>
              انصراف
            </Button>
            <Button 
              onClick={handleUploadDocument} 
              disabled={uploading || !selectedFile || !formData.title || !formData.category}
              className="bg-emerald-500 hover:bg-emerald-600 gap-2"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading ? 'در حال بارگذاری...' : 'بارگذاری'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}