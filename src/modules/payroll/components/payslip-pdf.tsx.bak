// src/modules/payroll/components/payslip-pdf.tsx
'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { toPersianDigits } from '@/core/lib/utils-fa'

// ============================================
// ثبت فونت
// ============================================
export const registerFonts = (key?: string) => {
  try {
    const fontRegular = require('../../../../public/fonts/Vazirmatn-Regular.ttf')
    const fontBold = require('../../../../public/fonts/Vazirmatn-Bold.ttf')
    
    const familyName = key ? `Vazirmatn-${key}` : 'Vazirmatn'
    
    Font.register({
      family: familyName,
      src: fontRegular,
      fontWeight: 400,
    })

    Font.register({
      family: familyName,
      src: fontBold,
      fontWeight: 700,
    })
    
    return familyName
  } catch (error) {
    console.error('Error registering fonts:', error)
    return 'Vazirmatn'
  }
}

registerFonts()

const RIALS_TO_TOMANS = (amount: number): string => {
  const tomans = amount / 10
  return tomans.toLocaleString('fa-IR')
}

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

// ============================================
// استایل‌ها - راست‌چین و ظریف‌تر
// ============================================
const getStyles = (fontFamily: string) => StyleSheet.create({
  page: {
    padding: 25,
    fontFamily: fontFamily,
    direction: 'rtl',
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
    borderBottomStyle: 'solid',
    paddingBottom: 8,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#065f46',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 3,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 0.3,
    borderBottomColor: '#e5e7eb',
  },
  label: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'right',
  },
  value: {
    fontSize: 8,
    fontWeight: 600,
    color: '#111827',
    textAlign: 'left',
  },
  valueGreen: {
    fontSize: 10,
    fontWeight: 700,
    color: '#047857',
    textAlign: 'left',
  },
  valueRed: {
    fontSize: 9,
    fontWeight: 600,
    color: '#e11d48',
    textAlign: 'left',
  },
  section: {
    marginBottom: 6,
    borderWidth: 0.5,
    borderColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#ecfdf5',
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontWeight: 700,
    fontSize: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  sectionBody: {
    padding: 4,
  },
  infoBox: {
    backgroundColor: '#f9fafb',
    padding: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
    paddingHorizontal: 3,
  },
  netRow: {
    backgroundColor: '#ecfdf5',
    padding: 8,
    borderRadius: 3,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  netLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: '#065f46',
    textAlign: 'right',
  },
  netValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#047857',
    textAlign: 'left',
  },
  footer: {
    textAlign: 'center',
    fontSize: 6,
    color: '#9ca3af',
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    marginTop: 8,
  },
})

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  draft: { label: 'پیش‌نویس', color: '#6b7280' },
  confirmed: { label: 'تأیید شده', color: '#1d4ed8' },
  paid: { label: 'پرداخت شده', color: '#065f46' },
  closed: { label: 'بسته شده', color: '#92400e' },
}

// ============================================
// Types
// ============================================
interface PayslipPDFProps {
  payslip: {
    id: string
    employeeId: string
    year: number
    month: number
    baseSalary: number
    totalAllowances: number
    totalDeductions: number
    grossSalary: number
    netSalary: number
    workDays: number
    overtimeHours: number
    status: string
    notes: string | null
    createdAt: string
    items: {
      id: string
      title: string
      category: string
      amount: number
    }[]
    employee?: {
      firstName: string
      lastName: string
      personnelCode: string
      department: string | null
    }
  }
  fontKey?: string
}

// ============================================
// تابع دریافت وضعیت
// ============================================
const getStatusInfo = (status: string) => {
  return STATUS_MAP[status] || STATUS_MAP.draft
}

// ============================================
// کامپوننت اصلی PDF
// ============================================
export function PayslipPDF({ payslip, fontKey }: PayslipPDFProps) {
  const fontFamily = fontKey ? `Vazirmatn-${fontKey}` : 'Vazirmatn'
  const styles = getStyles(fontFamily)

  const statusInfo = getStatusInfo(payslip.status)
  const monthName = PERSIAN_MONTHS[payslip.month - 1]
  
  const allowances = payslip.items.filter((item) => item.category === 'allowance')
  const deductions = payslip.items.filter((item) => item.category === 'deduction')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* هدر */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>فیش حقوقی</Text>
          <Text style={styles.headerSub}>
            {monthName} {toPersianDigits(payslip.year)}
          </Text>
        </View>

        {/* اطلاعات کارمند */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text>اطلاعات کارمند</Text>
            <Text style={{
              fontSize: 7,
              paddingHorizontal: 6,
              paddingVertical: 1,
              borderRadius: 10,
              backgroundColor: statusInfo.color + '20',
              color: statusInfo.color,
            }}>
              {statusInfo.label}
            </Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
               
                <Text style={styles.value}>
                  {payslip.employee?.firstName} {payslip.employee?.lastName}
                </Text>
                <Text style={styles.label}>نام و نام خانوادگی</Text>
              </View>
              <View style={styles.infoRow}>
               
                <Text style={styles.value}>
                  {toPersianDigits(payslip.employee?.personnelCode || '')}
                </Text>
                <Text style={styles.label}>کد پرسنلی</Text>
              </View>
            </View>
          </View>
        </View>

        {/* اطلاعات پایه */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text>اطلاعات پایه</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.row}>
            
              <Text style={styles.value}>
                {toPersianDigits(RIALS_TO_TOMANS(payslip.baseSalary))} تومان
              </Text>
              <Text style={styles.label}>حقوق پایه</Text>
            </View>
            <View style={styles.row}>
              
              <Text style={styles.value}>
                {toPersianDigits(payslip.workDays)} روز
              </Text>
              <Text style={styles.label}>کارکرد</Text>
            </View>
            <View style={styles.row}>
              
              <Text style={styles.value}>
                {toPersianDigits(payslip.overtimeHours)} ساعت
              </Text>
              <Text style={styles.label}>اضافه‌کاری</Text>
            </View>
          </View>
        </View>

        {/* مزایا */}
        {allowances.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text>مزایا</Text>
              <Text style={styles.valueGreen}>
                {toPersianDigits(RIALS_TO_TOMANS(payslip.totalAllowances))} تومان
              </Text>
            </View>
            <View style={styles.sectionBody}>
              {allowances.map((item) => (
                <View key={item.id} style={styles.row}>
                  
                  <Text style={styles.value}>
                    {toPersianDigits(RIALS_TO_TOMANS(item.amount))} تومان
                  </Text>
                  <Text style={styles.label}>{item.title}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* کسورات */}
        {deductions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text>کسورات</Text>
              <Text style={styles.valueRed}>
                {toPersianDigits(RIALS_TO_TOMANS(payslip.totalDeductions))} تومان
              </Text>
            </View>
            <View style={styles.sectionBody}>
              {deductions.map((item) => (
                <View key={item.id} style={styles.row}>
                
                  <Text style={styles.valueRed}>
                    {toPersianDigits(RIALS_TO_TOMANS(item.amount))} تومان
                  </Text>
                  <Text style={styles.label}>{item.title}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* جمع نهایی */}
        <View style={styles.netRow}>
      
          <Text style={styles.netValue}>
            {toPersianDigits(RIALS_TO_TOMANS(payslip.netSalary))} تومان
          </Text>
          <Text style={styles.netLabel}>خالص پرداختی</Text>
        </View>

        {/* یادداشت */}
        {payslip.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text>یادداشت</Text>
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.label}>{payslip.notes}</Text>
            </View>
          </View>
        )}

        {/* فوتر */}
        <View style={styles.footer}>
          <Text>تاریخ ثبت: {toPersianDigits(new Date(payslip.createdAt).toLocaleDateString('fa-IR'))}</Text>
          <Text style={{ marginTop: 2 }}>کد فیش: {payslip.id}</Text>
        </View>
      </Page>
    </Document>
  )
}