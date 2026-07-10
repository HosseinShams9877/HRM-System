// src/modules/contracts/components/ContractDialogs/contract-pdf.tsx
'use client'

import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

const getTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    'permanent': 'دائم',
    'temporary': 'موقت',
    'official': 'دائم',
    'contractual': 'قراردادی',
    'hourly': 'ساعتی',
    'part_time': 'پاره‌وقت',
    'full_time': 'تمام‌وقت',
    'contract': 'قراردادی',
    'freelance': 'آزاد',
  }
  return map[type] || type
}

const toPersianDigits = (num: number): string => {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)])
}

const formatShamsi = (date: string): string => {
  if (!date) return ''
  const parts = date.split('/')
  if (parts.length === 3) {
    const year = toPersianDigits(parseInt(parts[0]))
    const month = toPersianDigits(parseInt(parts[1]))
    const day = toPersianDigits(parseInt(parts[2]))
    return `${year}/${month}/${day}`
  }
  return date
}

export async function generateContractPDF(contract: any) {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const fontBytes = await fetch('/fonts/Vazirmatn-Regular.ttf').then(res => res.arrayBuffer())
  const font = await pdfDoc.embedFont(fontBytes)

  // ===== تابع برای صفحه جدید =====
  const addNewPage = () => {
    const newPage = pdfDoc.addPage([595, 842])
    const { height } = newPage.getSize()
    return { page: newPage, y: height - 50 }
  }

  let { page, y } = addNewPage()
  const { width, height } = page.getSize()
  const margin = 50

  // ============================================
  // هدر
  // ============================================
  page.drawText('قرارداد', {
    x: width / 2 - 40,
    y,
    size: 20,
    font,
    color: rgb(0.03, 0.4, 0.27),
  })
  y -= 28

  page.drawText('سازمان مدیریت منابع انسانی', {
    x: width / 2 - 70,
    y,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  })
  y -= 35

  // خط جداکننده
  page.drawLine({
    start: { x: margin, y: y + 5 },
    end: { x: width - margin, y: y + 5 },
    color: rgb(0.03, 0.4, 0.27),
    thickness: 2,
  })
  y -= 20

  // ============================================
  // اطلاعات قرارداد
  // ============================================
  page.drawText('اطلاعات قرارداد', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0.03, 0.4, 0.27),
  })
  y -= 15

  const infoStartY = y
  const infoHeight = 110

  // پس‌زمینه
  page.drawRectangle({
    x: margin,
    y: infoStartY - infoHeight,
    width: width - margin * 2,
    height: infoHeight,
    color: rgb(0.95, 0.98, 0.96),
  })
  page.drawRectangle({
    x: margin,
    y: infoStartY - infoHeight,
    width: width - margin * 2,
    height: infoHeight,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  })

  const infoData = [
    { label: 'شماره قرارداد:', value: contract.contractNumber || '-' },
    { label: 'کارمند:', value: `${contract.employee.firstName} ${contract.employee.lastName}` },
    { label: 'نوع قرارداد:', value: getTypeLabel(contract.type) },
    { label: 'تاریخ شروع:', value: formatShamsi(contract.startDate) },
    { label: 'تاریخ پایان:', value: contract.endDate ? formatShamsi(contract.endDate) : 'نامحدود' },
  ]

  let infoY = infoStartY - 12
  for (const item of infoData) {
    // برچسب (سمت راست)
    page.drawText(item.label, {
      x: margin + 10,
      y: infoY,
      size: 10,
      font,
      color: rgb(0.4, 0.4, 0.4),
    })
    // مقدار (سمت چپ)
    const labelWidth = 70
    page.drawText(item.value, {
      x: margin + labelWidth + 10,
      y: infoY,
      size: 10,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })
    infoY -= 20
  }

  y = infoStartY - infoHeight - 25

  // ============================================
  // متن قرارداد - با راست‌چین و استایل درست
  // ============================================
  page.drawText('متن قرارداد', {
    x: margin,
    y,
    size: 12,
    font,
    color: rgb(0.03, 0.4, 0.27),
  })
  y -= 15

  const textStartY = y
  const textHeight = 200

  // پس‌زمینه متن
  page.drawRectangle({
    x: margin,
    y: textStartY - textHeight,
    width: width - margin * 2,
    height: textHeight,
    color: rgb(0.95, 0.98, 0.96),
  })
  page.drawRectangle({
    x: margin,
    y: textStartY - textHeight,
    width: width - margin * 2,
    height: textHeight,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 1,
  })

  let textY = textStartY - 12
  const minTextY = textStartY - textHeight + 10

  if (contract.content) {
    const lines = contract.content.split('\n')
    let isFirstPage = true

    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) {
        textY -= 8
        continue
      }

      // اگه فضا تموم شد، صفحه جدید
      if (textY < minTextY) {
        const newPageData = addNewPage()
        page = newPageData.page
        y = newPageData.y
        textY = y - 12
        isFirstPage = false

        // عنوان ادامه در صفحه جدید
        page.drawText('ادامه متن قرارداد', {
          x: margin,
          y: y + 10,
          size: 10,
          font,
          color: rgb(0.03, 0.4, 0.27),
        })
        textY -= 15
      }

      // نمایش خط با راست‌چین
      page.drawText(trimmedLine, {
        x: margin + 10,
        y: textY,
        size: 9,
        font,
        color: rgb(0.1, 0.1, 0.1),
      })
      textY -= 16
    }
  }

  y = textY - 20

  // ============================================
  // امضاها
  // ============================================
  // اگه جا نیست، صفحه جدید
  if (y < 150) {
    const newPageData = addNewPage()
    page = newPageData.page
    y = newPageData.y
  }

  // خط بالای امضاها
  page.drawLine({
    start: { x: margin, y: y + 30 },
    end: { x: width - margin, y: y + 30 },
    color: rgb(0.8, 0.8, 0.8),
    thickness: 1,
  })

  const signWidth = (width - margin * 2 - 40) / 3
  const signatures = ['کارمند', 'مدیر واحد', 'مدیر منابع انسانی']

  for (let i = 0; i < 3; i++) {
    const x = margin + i * signWidth + (i === 2 ? 20 : 10)
    const signY = y

    // عنوان امضا
    page.drawText(signatures[i], {
      x: x + signWidth / 2 - 20,
      y: signY + 10,
      size: 11,
      font,
      color: rgb(0.1, 0.1, 0.1),
    })

    // فیلدهای امضا
    const fields = ['نام: ....................', 'امضاء: ....................', 'تاریخ: ....../....../......']
    let fieldY = signY - 10
    for (const field of fields) {
      page.drawText(field, {
        x: x + signWidth / 2 - 30,
        y: fieldY,
        size: 9,
        font,
        color: rgb(0.4, 0.4, 0.4),
      })
      fieldY -= 16
    }
  }

  // ============================================
  // فوتر
  // ============================================
  const footerY = 50
  page.drawText('این سند به صورت دیجیتال صادر شده و بدون مهر و امضاء معتبر می‌باشد.', {
    x: width / 2 - 140,
    y: footerY,
    size: 8,
    font,
    color: rgb(0.6, 0.6, 0.6),
  })

  const contractNumber = contract.contractNumber || 'unknown'
  const persianNumber = contractNumber.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
  page.drawText(`کد پیگیری: ${persianNumber}`, {
    x: width / 2 - 50,
    y: footerY - 12,
    size: 8,
    font,
    color: rgb(0.6, 0.6, 0.6),
  })

  return await pdfDoc.save()
}