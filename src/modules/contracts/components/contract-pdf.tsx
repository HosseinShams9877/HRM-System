// src/modules/contracts/components/ContractDialogs/contract-pdf.tsx
'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// ===== ثبت فونت =====
try {
  const fontRegular = require('../../../../../public/fonts/Vazirmatn-Regular.ttf')
  Font.register({
    family: 'Vazirmatn',
    src: fontRegular,
    fontWeight: 400,
  })

  const fontBold = require('../../../../../public/fonts/Vazirmatn-Bold.ttf')
  Font.register({
    family: 'Vazirmatn',
    src: fontBold,
    fontWeight: 700,
  })
} catch (error) {
  console.error('Error loading fonts:', error)
}

const cleanAndFormatContent = (text: string): string => {
  if (!text) return ''
  
  let cleaned = text
    // فقط کاراکترهای کنترل و غیرقابل چاپ رو حذف کن
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // حذف کاراکترهای خاص غیرضروری (اما نه حروف فارسی)
    .replace(/[©®™@ÂZ{}ü‡‰‹•‘ò]/g, '')
    // حذف متغیرهای حل نشده
    .replace(/\{\{.*?\}\}/g, '')
    // اصلاح فاصله‌های اضافی (اما نه حذف کامل)
    .replace(/[ ]{2,}/g, ' ')
    // حفظ خطوط جدید
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
  
  // حذف خطوط خالی اضافی (اما نه همه)
  cleaned = cleaned.split('\n')
    .map(line => line.trimEnd()) // فقط فضای آخر خط رو حذف کن
    .join('\n')
  
  return cleaned
}
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Vazirmatn',
    direction: 'rtl', // ← راست‌چین اصلی
  },
  header: {
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#065f46',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#ecfdf5',
    padding: 8,
    fontWeight: 700,
    fontSize: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    textAlign: 'center', // تیتر وسط
  },
  sectionBody: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    borderBottomStyle: 'solid',
  },
  value: {
    fontSize: 11,
    color: '#111827',
    fontWeight: 600,
    textAlign: 'right', 
  },
  label: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'right', 
  },
  content: {
    fontSize: 11,
    lineHeight: 1.8,
    color: '#1a1a1a',
    textAlign: 'right', // راست ← اینجا عوض شد
    direction: 'rtl', // ← اضافه شد
    whiteSpace: 'pre-wrap', 
    wordBreak: 'break-word', 
  },
  footer: {
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    marginTop: 16,
  },
})

interface ContractPDFProps {
  contract: {
    contractNumber?: string
    type: string
    startDate: string
    endDate?: string
    content?: string
    employee: {
      firstName: string
      lastName: string
    }
  }
}

export function ContractPDF({ contract }: ContractPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* هدر */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>قرارداد</Text>
          <Text style={styles.headerSub}>سازمان مدیریت منابع انسانی</Text>
        </View>

        {/* اطلاعات قرارداد */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text>اطلاعات قرارداد</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
            <Text style={styles.value}>{contract.contractNumber || '-'}</Text>
              <Text style={styles.label}>شماره قرارداد</Text>
              
            </View>
            <View style={styles.row}>
            <Text style={styles.value}>{contract.employee.firstName} {contract.employee.lastName}</Text>
              <Text style={styles.label}>کارمند</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.value}>{contract.type}</Text>
              <Text style={styles.label}>نوع قرارداد</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.value}>{contract.startDate}</Text>
              <Text style={styles.label}>تاریخ شروع</Text>
            </View>
            <View style={styles.row}>
            <Text style={styles.value}>{contract.endDate || 'نامحدود'}</Text>
              <Text style={styles.label}>تاریخ پایان</Text>
            </View>
          </View>
        </View>

        {/* متن قرارداد */}
        {contract.content && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text>متن قرارداد</Text>
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.content}>{cleanAndFormatContent(contract.content)}</Text>
            </View>
          </View>
        )}

        {/* امضاها */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16, marginTop: 20 }}>
          <View style={{ textAlign: 'center', padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, flex: 1 }}>
            <Text style={{ fontWeight: 700, marginBottom: 16, fontSize: 12, textAlign: 'center' }}>کارمند</Text>
            <Text style={{ fontSize: 10, color: '#4b5563', marginVertical: 2, textAlign: 'center' }}>نام: ....................</Text>
            <Text style={{ fontSize: 10, color: '#4b5563', marginVertical: 2, textAlign: 'center' }}>امضاء: ....................</Text>
            <Text style={{ fontSize: 10, color: '#4b5563', marginVertical: 2, textAlign: 'center' }}>تاریخ: ....../....../......</Text>
          </View>
          <View style={{ textAlign: 'center', padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, flex: 1 }}>
            <Text style={{ fontWeight: 700, marginBottom: 16, fontSize: 12, textAlign: 'center' }}>مدیر واحد</Text>
            <Text style={{ fontSize: 10, color: '#4b5563', marginVertical: 2, textAlign: 'center' }}>نام: ....................</Text>
            <Text style={{ fontSize: 10, color: '#4b5563', marginVertical: 2, textAlign: 'center' }}>امضاء: ....................</Text>
            <Text style={{ fontSize: 10, color: '#4b5563', marginVertical: 2, textAlign: 'center' }}>تاریخ: ....../....../......</Text>
          </View>
          <View style={{ textAlign: 'center', padding: 12, backgroundColor: '#f9fafb', borderRadius: 8, flex: 1 }}>
            <Text style={{ fontWeight: 700, marginBottom: 16, fontSize: 12, textAlign: 'center' }}>مدیر منابع انسانی</Text>
            <Text style={{ fontSize: 10, color: '#4b5563', marginVertical: 2, textAlign: 'center' }}>نام: ....................</Text>
            <Text style={{ fontSize: 10, color: '#4b5563', marginVertical: 2, textAlign: 'center' }}>امضاء: ....................</Text>
            <Text style={{ fontSize: 10, color: '#4b5563', marginVertical: 2, textAlign: 'center' }}>تاریخ: ....../....../......</Text>
          </View>
        </View>

        {/* فوتر */}
        <View style={styles.footer}>
          <Text>این سند به صورت دیجیتال صادر شده و بدون مهر و امضاء معتبر می‌باشد.</Text>
          <Text style={{ marginTop: 4 }}>کد پیگیری: {contract.contractNumber || 'unknown'}</Text>
        </View>
      </Page>
    </Document>
  )
} 