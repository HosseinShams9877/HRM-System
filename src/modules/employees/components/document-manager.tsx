'use client'

import { useState, useRef } from 'react'
import {
  Upload, File, FileText, Image, FileSpreadsheet, Trash2,
  Download, Eye, Plus, X, Loader2, FolderOpen, Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/button'
import { Badge } from '@/core/components/ui/badge'
import { Input } from '@/core/components/ui/input'
import { Label } from '@/core/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/core/components/ui/dialog'
import { Separator } from '@/core/components/ui/separator'
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
  documents: Document[]
  onRefresh: () => void
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

export function DocumentManager({ employeeId, documents, onRefresh }: DocumentManagerProps) {
  const [showUpload, setShowUpload] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchDoc, setSearchDoc] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
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

  // Filter documents
  const filteredDocs = documents.filter(d => {
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false
    if (searchDoc && !d.title.includes(searchDoc) && !d.fileName.includes(searchDoc)) return false
    return true
  })

  // Group by category
  const grouped = filteredDocs.reduce<Record<string, Document[]>>((acc, doc) => {
    const cat = doc.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(doc)
    return acc
  }, {})

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
      // In production, you'd upload to cloud storage (S3, etc.)
      // For now, we save the metadata to the database
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
        onRefresh()
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
        onRefresh()
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
        <Button size="sm" className="gap-1.5" onClick={() => setShowUpload(true)}>
          <Upload className="w-3.5 h-3.5" />
          آپلود مدرک
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

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">مدرکی یافت نشد</p>
            <Button variant="outline" size="sm" className="mt-3 gap-1.5" onClick={() => setShowUpload(true)}>
              <Upload className="w-3.5 h-3.5" />
              آپلود اولین مدرک
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, docs]) => {
            const catConfig = CATEGORIES[cat] || CATEGORIES.other
            return (
              <div key={cat}>
                <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <catConfig.icon className="w-3.5 h-3.5" />
                  {catConfig.label} ({toPersianDigits(docs.length)})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {docs.map(doc => (
                    <Card key={doc.id} className="border-0 shadow-sm group hover:shadow-md transition-all">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-muted/50 shrink-0">
                            <FileIcon type={doc.fileType} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm font-medium truncate">{doc.title}</h5>
                            <p className="text-[10px] text-muted-foreground truncate">{doc.fileName}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Badge className={`text-[9px] ${catConfig.color}`}>{catConfig.label}</Badge>
                              <span className="text-[10px] text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {formatShamsi(doc.createdAt.split('T')[0])}
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-red-500 hover:text-red-600"
                              onClick={() => setDeleteId(doc.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
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
