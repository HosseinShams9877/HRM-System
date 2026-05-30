'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Upload, File, FileText, Image, FileSpreadsheet, Trash2,
  Download, Eye, Plus, X, Loader2, FolderOpen, Search, MoreHorizontal, Edit
} from 'lucide-react'
import { Card, CardContent } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu'
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
  documents?: Document[]
  canEdit?: boolean
  onRefresh?: () => void
  onEditEmployee?: () => void
}

// ============================================
// Category Config
// ============================================

const CATEGORIES: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  identity: { label: 'هویتی', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: FileText },
  education: { label: 'تحصیلی', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', icon: FileText },
  medical: { label: 'پزشکی', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: File },
  contract: { label: 'قرارداد', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: FileText },
  history: { label: 'سوابق', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300', icon: FolderOpen },
  other: { label: 'سایر', color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300', icon: File },
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

export function DocumentManager({ employeeId, documents: propDocuments, onRefresh, onEditEmployee }: DocumentManagerProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchDoc, setSearchDoc] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [documents, setDocuments] = useState<Document[]>(propDocuments || [])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: '',
    description: '',
    fileName: '',
    filePath: '',
    fileType: '',
    fileSize: 0,
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Fetch documents when component mounts
  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/employees/${employeeId}/documents`)
      if (res.ok) {
        const data = await res.json()
        const docs = data.data || data.records || data
        setDocuments(Array.isArray(docs) ? docs : [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load documents when employeeId changes OR when propDocuments is not provided
  useEffect(() => {
    if (propDocuments) {
      setDocuments(propDocuments)
    } else {
      fetchDocuments()
    }
  }, [employeeId, propDocuments])

  // Filter documents
  const filteredDocs = documents.filter(d => {
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false
    if (searchDoc && !d.title.includes(searchDoc) && !d.fileName.includes(searchDoc)) return false
    return true
  })

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      setUploadForm(prev => ({
        ...prev,
        fileName: file.name,
        filePath: `/uploads/${employeeId}/${file.name}`,
        fileType: ext,
        fileSize: file.size,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
      }))
    }
  }

  // Handle upload
  const handleUpload = async () => {
    if (!uploadForm.title || !uploadForm.category || !uploadForm.fileName) {
      toast({ title: 'عنوان، دسته‌بندی و فایل الزامی است', variant: 'destructive' })
      return
    }

    setUploading(true)
    try {
      const res = await fetch(`/api/employees/${employeeId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadForm),
      })

      if (res.ok) {
        toast({ title: 'مدرک با موفقیت آپلود شد' })
        setShowUpload(false)
        setUploadForm({ title: '', category: '', description: '', fileName: '', filePath: '', fileType: '', fileSize: 0 })
        setSelectedFile(null)
        fetchDocuments()
        onRefresh?.()
      } else {
        toast({ title: 'خطا در آپلود مدرک', variant: 'destructive' })
      }
    } catch (err) {
      toast({ title: 'خطا در آپلود مدرک', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }

  // Handle delete
  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/employees/${employeeId}/documents?docId=${deleteId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        toast({ title: 'مدرک حذف شد' })
        fetchDocuments()
        onRefresh?.()
      }
    } catch (err) {
      toast({ title: 'خطا در حذف مدرک', variant: 'destructive' })
    } finally {
      setDeleting(false)
      setDeleteId(null)
    }
  }

  // Count by category
  const countByCategory = documents.reduce<Record<string, number>>((acc, d) => {
    const cat = d.category || 'other'
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})

  if (loading) {
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

      {/* Documents Table - جدول مانند و تمام عرض */}
      {filteredDocs.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">مدرکی یافت نشد</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-900">
                <th className="text-right py-3 px-4 text-gray-500 font-medium">نام مدرک</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">دسته بندی</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">تاریخ آپلود</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">حجم</th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.map((doc) => {
                const category = CATEGORIES[doc.category] || CATEGORIES.other
                return (
                  <tr key={doc.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-muted/50 shrink-0">
                          <FileIcon type={doc.fileType} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-gray-200">{doc.title}</p>
                          {doc.description && (
                            <p className="text-xs text-gray-400 mt-0.5">{doc.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                    <Badge className={`text-xs ${category.color}`}>
  <category.icon className="w-3 h-3 inline ml-1" />
  {category.label}
</Badge>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatShamsi(doc.createdAt.split('T')[0])}
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => window.open(doc.filePath, '_blank')}
                          title="دانلود"
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
                            <DropdownMenuItem 
                              className="text-amber-600 gap-2 cursor-pointer"
                              onClick={() => onEditEmployee?.()}
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
              آپلود مدرک جدید
            </DialogTitle>
            <DialogDescription>
              فایل مدرک را انتخاب و اطلاعات آن را تکمیل کنید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* File Selection */}
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2">
                  <FileIcon type={uploadForm.fileType} />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">({formatFileSize(selectedFile.size)})</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">فایل را اینجا کلیک کنید یا بکشید</p>
                  <p className="text-[10px] text-muted-foreground mt-1">PDF, JPG, PNG, DOC, XLS</p>
                </>
              )}
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">عنوان مدرک <span className="text-red-500">*</span></Label>
                <Input
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="کارت ملی، شناسنامه، مدرک تحصیلی..."
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">دسته‌بندی <span className="text-red-500">*</span></Label>
                <Select value={uploadForm.category} onValueChange={(v) => setUploadForm(prev => ({ ...prev, category: v }))}>
                  <SelectTrigger><SelectValue placeholder="انتخاب دسته‌بندی" /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                      <SelectItem key={key} value={key}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">توضیحات</Label>
                <Input
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="توضیح اختیاری"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowUpload(false); setSelectedFile(null) }}>انصراف</Button>
            <Button onClick={handleUpload} disabled={uploading || !uploadForm.title || !uploadForm.category || !uploadForm.fileName} className="gap-2">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              آپلود
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
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}