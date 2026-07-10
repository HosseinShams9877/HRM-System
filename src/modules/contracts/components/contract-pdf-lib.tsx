// src/modules/contracts/components/ContractDialogs/contract-pdf.tsx
'use client'

import * as pdfMake from 'pdfmake'

// ===== تنظیم فونت برای Next.js با روش درست =====
try {
  // روش جایگزین برای لود فونت‌ها
  const fonts = require('pdfmake/build/vfs_fonts')
  if (fonts && fonts.pdfMake && fonts.pdfMake.vfs) {
    pdfMake.vfs = fonts.pdfMake.vfs
  }
} catch (e) {
  console.warn('Font loading error:', e)
  // اگر فونت لود نشد، از vfs خالی استفاده کن
  pdfMake.vfs = {}
}

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

export async function generateContractPDF(contract: any): Promise<Uint8Array> {
  const contentLines = contract.content ? contract.content.split('\n').filter((line: string) => line.trim()) : []

  const docDefinition: any = {
    content: [
      { text: 'قرارداد', style: 'header', alignment: 'center' },
      { text: 'سازمان مدیریت منابع انسانی', style: 'subheader', alignment: 'center' },
      { text: '', margin: [0, 10] },
      { text: 'اطلاعات قرارداد', style: 'sectionHeader' },
      {
        table: {
          widths: ['30%', '70%'],
          body: [
            [{ text: 'شماره قرارداد:', alignment: 'right' }, { text: contract.contractNumber || '-', alignment: 'right' }],
            [{ text: 'کارمند:', alignment: 'right' }, { text: `${contract.employee.firstName} ${contract.employee.lastName}`, alignment: 'right' }],
            [{ text: 'نوع قرارداد:', alignment: 'right' }, { text: getTypeLabel(contract.type), alignment: 'right' }],
            [{ text: 'تاریخ شروع:', alignment: 'right' }, { text: formatShamsi(contract.startDate), alignment: 'right' }],
            [{ text: 'تاریخ پایان:', alignment: 'right' }, { text: contract.endDate ? formatShamsi(contract.endDate) : 'نامحدود', alignment: 'right' }],
          ]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 0,
          hLineColor: () => '#e5e7eb',
          paddingLeft: () => 10,
          paddingRight: () => 10,
          paddingTop: () => 8,
          paddingBottom: () => 8,
        },
        margin: [0, 5, 0, 15],
      },
      { text: 'متن قرارداد', style: 'sectionHeader', margin: [0, 10, 0, 10] },
      ...contentLines.map((line: string) => ({
        text: line,
        style: 'contentText',
        margin: [0, 3, 0, 3],
        alignment: 'right',
      })),
      { text: '', margin: [0, 20] },
      {
        columns: [
          { text: 'کارمند\n\nنام: ....................\nامضاء: ....................\nتاریخ: ....../....../......', alignment: 'center' },
          { text: 'مدیر واحد\n\nنام: ....................\nامضاء: ....................\nتاریخ: ....../....../......', alignment: 'center' },
          { text: 'مدیر منابع انسانی\n\nنام: ....................\nامضاء: ....................\nتاریخ: ....../....../......', alignment: 'center' }
        ],
        columnGap: 15,
        margin: [0, 10, 0, 20],
      },
      { 
        text: 'این سند به صورت دیجیتال صادر شده و بدون مهر و امضاء معتبر می‌باشد.', 
        alignment: 'center', 
        fontSize: 8, 
        color: '#9ca3af',
        margin: [0, 10, 0, 5],
      },
      { 
        text: `کد پیگیری: ${contract.contractNumber || 'unknown'}`, 
        alignment: 'center', 
        fontSize: 8, 
        color: '#9ca3af',
      },
    ],
    styles: {
      header: { 
        fontSize: 20, 
        bold: true, 
        color: '#065f46', 
        margin: [0, 0, 0, 10],
        alignment: 'center',
      },
      subheader: { 
        fontSize: 10, 
        color: '#6b7280', 
        margin: [0, 0, 0, 20],
        alignment: 'center',
      },
      sectionHeader: { 
        fontSize: 14, 
        bold: true, 
        color: '#065f46',
        alignment: 'right',
      },
      contentText: {
        fontSize: 10,
        color: '#1a1a1a',
        alignment: 'right',
        lineHeight: 1.6,
      },
    },
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    defaultStyle: {
      font: 'Roboto',
    },
  }

  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition)
      pdfDoc.getBuffer((buffer: Buffer) => {
        resolve(new Uint8Array(buffer))
      })
    } catch (error) {
      reject(error)
    }
  })
}