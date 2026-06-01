'use client'

import { useState, useRef } from 'react'
import {
  Upload, File, FileText, Image, FileSpreadsheet, Trash2,
  Download, Plus, Loader2, FolderOpen, Search, MoreHorizontal, Edit
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Textarea } from '@/core/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
import { useDocuments, useUploadDocument, useDeleteDocument, useUpdateDocument } from '../hooks'
import { useToast } from '@/core/hooks/use-toast'
import { toPersianDigits, formatShamsi } from '@/core/lib/utils-fa'

// ============================================
// Types
// ============================================

interface Document {
  id: string
  title: string
  category: string
  fileName: string
  filePath: string
  fileType: string
  fileSize: number
  description: string | null
  createdAt: string
}

interface DocumentManagerProps {
  employeeId: string
  canEdit?: boolean
  onRefresh?: () => void
  onEditEmployee?: () => void
}

// ============================================
// Category Config
// ============================================

const CATEGORIES: Record<string, { label: string; color: string; icon: string }> = {
  identification: { label: 'مدارک شناسایی', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: '🆔' },
  education: { label: 'مدارک تحصیلی', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: '🎓' },
  military: { label: 'مدارک نظام وظیفه', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: '🪖' },
  resume: { label: 'رزومه', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', icon: '📄' },
  contract: { label: 'قراردادها', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300', icon: '📑' },
  certificate: { label: 'گواهینامه‌ها', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', icon: '🏆' },
  medical: { label: 'مدارک پزشکی', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: '🏥' },
  insurance: { label: 'بیمه', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300', icon: '🛡️' },
  other: { label: 'سایر مدارک', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300', icon: '📁' },
}

// ============================================
// File Icon
// ============================================

function FileIcon({ type }: { type: string }) {
  if (type === 'pdf') return <FileText className="w-5 h-5 text-red-500" />
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) return <Image className="w-5 h-5 text-blue-500" />
  if (['doc', 'docx'].includes(type)) return <FileText className="w-5 h-5 text-blue-600" />
  if (['xls', 'xlsx'].includes(type)) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
  return <File className="w-5 h-5 text-slate-500" />
}

// ============================================
// Format File Size
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return toPersianDigits(bytes) + ' بایت'
  if (bytes < 1024 * 1024) return toPersianDigits((bytes / 1024).toFixed(1)) + ' کیلوبایت'
  return toPersianDigits((bytes / (1024 * 1024)).toFixed(1)) + ' مگابایت'
}

// ============================================
// Document Manager Component
// ============================================

export function DocumentManager({ employeeId, onRefresh, onEditEmployee }: DocumentManagerProps) {
  // ========== React Query Hooks ==========
  const { data: documents = [], isLoading, refetch } = useDocuments(employeeId)
  const uploadMutation = useUploadDocument()
  const deleteMutation = useDeleteDocument()
  const updateMutation = useUpdateDocument()

  // ========== Local State ==========
  const [showUpload, setShowUpload] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchDoc, setSearchDoc] = useState('')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: '',
    description: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    category: '',
    description: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // ========== Handlers ==========
  
  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(doc.filePath)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = doc.fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      toast({ title: 'خطا در دانلود فایل', variant: 'destructive' })
    }
  }

  const handleUpload = () => {
    if (!selectedFile || !uploadFormData.title || !uploadFormData.category) {
      toast({ title: 'لطفاً فایل، عنوان و دسته‌بندی را انتخاب کنید', variant: 'destructive' })
      return
    }

    uploadMutation.mutate({
      employeeId,
      file: selectedFile,
      title: uploadFormData.title,
      category: uploadFormData.category,
      description: uploadFormData.description,
    }, {
      onSuccess: () => {
        setShowUpload(false)
        setSelectedFile(null)
        setUploadFormData({ title: '', category: '', description: '' })
        onRefresh?.()
      }
    })
  }

  const handleDelete = () => {
    if (!deleteId) return
    
    deleteMutation.mutate({ employeeId, docId: deleteId }, {
      onSuccess: () => {
        setDeleteId(null)
        onRefresh?.()
      }
    })
  }

  const handleEditDocument = () => {
    if (!editingDoc) return
    
    updateMutation.mutate({
      employeeId,
      docId: editingDoc.id,
      data: {
        title: editFormData.title,
        category: editFormData.category,
        description: editFormData.description,
      }
    }, {
      onSuccess: () => {
        setShowEditDialog(false)
        setEditingDoc(null)
        onRefresh?.()
      }
    })
  }

  const openEditDialog = (doc: Document) => {
    setEditingDoc(doc)
    setEditFormData({
      title: doc.title,
      category: doc.category,
      description: doc.description || '',
    })
    setShowEditDialog(true)
  }

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false
    if (searchDoc && !doc.title.includes(searchDoc) && !doc.fileName.includes(searchDoc)) return false
    return true
  })

  // Count by category
  const countByCategory = documents.reduce<Record<string, number>>((acc, d) => {
    const cat = d.category || 'other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-amber-600" />
            پرونده الکترونیک
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {toPersianDigits(documents.length)} مدرک آپلود شده
          </p>
        </div>
        <Button 
          onClick={() => setShowUpload(true)}
          size="sm"
          className="gap-1.5 bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="w-3.5 h-3.5" />
          افزودن مدرک
        </Button>
      </div>

      {/* Category Filter & Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="جستجوی مدرک..."
            value={searchDoc}
            onChange={(e) => setSearchDoc(e.target.value)}
            className="pr-8 h-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <Button
            variant={categoryFilter === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-[10px]"
            onClick={() => setCategoryFilter('all')}
          >
            همه ({toPersianDigits(documents.length)})
          </Button>
          {Object.entries(CATEGORIES).map(([key, cat]) => {
            const count = countByCategory[key] || 0
            if (count === 0) return null
            return (
              <Button
                key={key}
                variant={categoryFilter === key ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 text-[10px]"
                onClick={() => setCategoryFilter(key)}
              >
                {cat.label} ({toPersianDigits(count)})
              </Button>
            )
          })}
        </div>
      </div>

      {/* Documents Table */}
      {filteredDocs.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">مدرکی یافت نشد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-900">
                <th className="text-right py-3 px-4 text-gray-500 font-medium">عملیات</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">حجم</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">تاریخ آپلود</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">دسته بندی</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">نام مدرک</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => {
                const category = CATEGORIES[doc.category] || CATEGORIES.other
                return (
                  <tr key={doc.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    {/* عملیات */}
                    <td className="py-3 px-4 align-top text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="text-amber-600 gap-2 cursor-pointer"
                              onClick={() => openEditDialog(doc)}
                            >
                              <Edit className="w-3.5 h-3.5" />
                              ویرایش
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-rose-600 gap-2 cursor-pointer"
                              onClick={() => setDeleteId(doc.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleDownload(doc)}
                          title="دانلود"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                    
                    {/* حجم */}
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 align-top whitespace-nowrap text-right">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    
                    {/* تاریخ آپلود */}
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400 align-top whitespace-nowrap text-right">
                      {formatShamsi(doc.createdAt.split('T')[0])}
                    </td>
                    
                    {/* دسته بندی */}
                    <td className="py-3 px-4 align-top text-right">
                      <Badge className={`text-xs whitespace-nowrap ${category.color}`}>
                        <span className="ml-1">{category.icon}</span>
                        {category.label}
                      </Badge>
                    </td>
                    
                    {/* نام مدرک */}
                    <td className="py-3 px-4 align-top text-right">
                      <div className="flex items-start gap-3 justify-end">
                        <div className="flex-1 min-w-0 text-right">
                          <p className="font-medium text-gray-800 dark:text-gray-200 break-words">
                            {doc.title}
                          </p>
                          {doc.description && (
                            <p className="text-xs text-gray-400 mt-1 break-words">
                              {doc.description}
                            </p>
                          )}
                        </div>
                        <div className="p-1.5 rounded-lg bg-muted/50 shrink-0 mt-0.5">
                          <FileIcon type={doc.fileType} />
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-emerald-600" />
              افزودن مدرک جدید
            </DialogTitle>
            <DialogDescription>
              اطلاعات مدرک را وارد کنید
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Selection */}
            <div className="space-y-2">
              <Label className="text-xs">فایل <span className="text-red-500">*</span></Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-emerald-400 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {selectedFile ? selectedFile.name : 'برای انتخاب فایل کلیک کنید'}
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG, DOC, XLS (حداکثر 5MB)</p>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label className="text-xs">عنوان مدرک <span className="text-red-500">*</span></Label>
              <Input
                value={uploadFormData.title}
                onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
                placeholder="مثال: مدرک تحصیلی کارشناسی"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="text-xs">دسته بندی <span className="text-red-500">*</span></Label>
              <Select value={uploadFormData.category} onValueChange={(v) => setUploadFormData({ ...uploadFormData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته بندی..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      <span className="ml-1">{cat.icon}</span>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="text-xs">توضیحات</Label>
              <Textarea
                value={uploadFormData.description}
                onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
                placeholder="توضیحات اضافی..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => {
              setShowUpload(false)
              setSelectedFile(null)
              setUploadFormData({ title: '', category: '', description: '' })
            }}>
              انصراف
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={uploadMutation.isPending || !selectedFile || !uploadFormData.title || !uploadFormData.category}
              className="bg-emerald-500 hover:bg-emerald-600 gap-2"
            >
              {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadMutation.isPending ? 'در حال آپلود...' : 'آپلود'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-amber-600" />
              ویرایش مدرک
            </DialogTitle>
            <DialogDescription>
              اطلاعات مدرک را ویرایش کنید
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs">عنوان مدرک <span className="text-red-500">*</span></Label>
              <Input
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                placeholder="عنوان مدرک"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs">دسته بندی <span className="text-red-500">*</span></Label>
              <Select value={editFormData.category} onValueChange={(v) => setEditFormData({ ...editFormData, category: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب دسته بندی..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      <span className="ml-1">{cat.icon}</span>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs">توضیحات</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="توضیحات اضافی..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              انصراف
            </Button>
            <Button 
              onClick={handleEditDocument} 
              disabled={updateMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 gap-2"
            >
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
              {updateMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>تایید حذف مدرک</DialogTitle>
            <DialogDescription>آیا از حذف این مدرک اطمینان دارید؟ این عمل قابل بازگشت نیست.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteId(null)}>انصراف</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}