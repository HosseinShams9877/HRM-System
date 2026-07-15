// src/modules/recruitment/components/candidate-pdf.tsx

'use client'

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { toPersianNumber } from '../helpers'

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
const toPersianDigits = (str: string): string => {
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
  return str.replace(/\d/g, (digit) => persianDigits[parseInt(digit)])
}
const convertToPersianDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '—'
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    if (isNaN(date.getTime())) return '—'
    
    const persianDate = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
    
    return toPersianDigits(persianDate)
  } catch (error) {
    return '—'
  }
}

registerFonts()

// ============================================
// استایل‌ها
// ============================================
const getStyles = (fontFamily: string) => StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: fontFamily,
    direction: 'rtl',
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
    borderBottomStyle: 'solid',
    paddingBottom: 10,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#065f46',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#ecfdf5',
    padding: 6,
    fontWeight: 700,
    fontSize: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    textAlign: 'center',
  },
  sectionBody: {
    padding: 6,
  },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridItem: {
    width: '49.5%',
    backgroundColor: '#f9fafb',
    padding: 4,
    borderRadius: 3,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  gridItemFull: {
    width: '100%',
    backgroundColor: '#f9fafb',
    padding: 4,
    borderRadius: 3,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  label: {
    fontSize: 7,
    color: '#6b7280',
    textAlign: 'right',
    width: '100%',
  },
  value: {
    fontSize: 9,
    fontWeight: 600,
    color: '#111827',
    marginTop: 1,
    textAlign: 'right',
    width: '100%',
  },
  valueSmall: {
    fontSize: 8,
    fontWeight: 500,
    color: '#1f2937',
    marginTop: 1,
    textAlign: 'right',
    width: '100%',
  },
  skillsContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 3,
  },
  skillTag: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    fontSize: 7,
    color: '#065f46',
    direction: 'rtl', 
    textAlign: 'right',
  },
  coverLetter: {
    fontSize: 8,
    lineHeight: 1.5,
    color: '#1f2937',
    textAlign: 'right',
    padding: 4,
    backgroundColor: '#fafafa',
    borderRadius: 3,
  },
  footer: {
    textAlign: 'center',
    fontSize: 7,
    color: '#9ca3af',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    marginTop: 10,
  },
})

// ============================================
// Types
// ============================================
interface CandidatePDFProps {
  candidate: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string | null
    nationalId?: string | null
    gender?: string | null
    birthDate?: string | null
    city?: string | null
    educationLevel?: string | null
    educationField?: string | null
    university?: string | null
    experienceYears: number
    currentCompany?: string | null
    skills?: string | null
    linkedinUrl?: string | null
    portfolioUrl?: string | null
    resumeUrl?: string | null
    coverLetter?: string | null
    source?: string | null
    status?: string | null
    notes?: string | null
  }
  fontKey?: string
}

// ============================================
// تابع تبدیل جنسیت
// ============================================
const getGenderLabel = (gender: string | null | undefined) => {
  if (!gender) return '—'
  return gender === 'male' ? 'مرد' : gender === 'female' ? 'زن' : gender
}

// ============================================
// تابع تبدیل وضعیت
// ============================================
const getStatusLabel = (status: string | null | undefined) => {
  if (!status) return '—'
  return status === 'active' ? 'فعال' : 
         status === 'inactive' ? 'غیرفعال' : 
         status === 'blocked' ? 'مسدود' : status
}

// ============================================
// تابع تبدیل منبع
// ============================================
const getSourceLabel = (source: string | null | undefined) => {
  if (!source) return '—'
  return source === 'website' ? 'وب‌سایت' :
         source === 'linkedin' ? 'لینکدین' :
         source === 'referral' ? 'معرفی' :
         source === 'job_site' ? 'سایت کاریابی' : 
         source === 'other' ? 'سایر' : source
}

// ============================================
// تابع تبدیل مقطع تحصیلی
// ============================================
const getEducationLabel = (level: string | null | undefined) => {
  if (!level) return '—'
  return level === 'diploma' ? 'دیپلم' :
         level === 'associate' ? 'کاردانی' :
         level === 'bachelor' ? 'کارشناسی' :
         level === 'master' ? 'کارشناسی ارشد' :
         level === 'phd' ? 'دکتری' : level
}

// ============================================
// کامپوننت اصلی PDF
// ============================================
export function CandidatePDF({ candidate, fontKey }: CandidatePDFProps) {
  const fontFamily = fontKey ? `Vazirmatn-${fontKey}` : 'Vazirmatn'
  const styles = getStyles(fontFamily)

  // تبدیل مهارت‌ها به آرایه
  const skillsArray = candidate.skills 
    ? candidate.skills.split(',').map(s => s.trim()).filter(Boolean)
    : []

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* هدر */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>رزومه کاندیدا</Text>
          <Text style={styles.headerSub}>
            {candidate.firstName} {candidate.lastName}
          </Text>
        </View>

        {/* اطلاعات شخصی */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text>اطلاعات شخصی</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.grid2}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>نام و نام خانوادگی</Text>
                <Text style={styles.value}>{candidate.firstName} {candidate.lastName}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>ایمیل</Text>
                <Text style={styles.value}>{candidate.email}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>شماره تماس</Text>
                <Text style={styles.value}>{candidate.phone ? toPersianNumber(candidate.phone) : '—'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>کد ملی</Text>
                <Text style={styles.value}>{candidate.nationalId ? toPersianNumber(candidate.nationalId) : '—'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>جنسیت</Text>
                <Text style={styles.value}>{getGenderLabel(candidate.gender)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>تاریخ تولد</Text>
                <Text style={styles.value}>{convertToPersianDate(candidate.birthDate)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>شهر</Text>
                <Text style={styles.value}>{candidate.city || '—'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>وضعیت</Text>
                <Text style={styles.value}>{getStatusLabel(candidate.status)}</Text>
              </View>
              <View style={styles.gridItemFull}>
                <Text style={styles.label}>منبع</Text>
                <Text style={styles.value}>{getSourceLabel(candidate.source)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* تحصیلات */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text>تحصیلات و تجربه</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.grid2}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>مقطع تحصیلی</Text>
                <Text style={styles.value}>{getEducationLabel(candidate.educationLevel)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>رشته تحصیلی</Text>
                <Text style={styles.value}>{candidate.educationField || '—'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>دانشگاه</Text>
                <Text style={styles.value}>{candidate.university || '—'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>سال‌های سابقه</Text>
                <Text style={styles.value}>{toPersianNumber(candidate.experienceYears)} سال</Text>
              </View>
              <View style={styles.gridItemFull}>
                <Text style={styles.label}>شرکت فعلی</Text>
                <Text style={styles.valueSmall}>{candidate.currentCompany || '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* مهارت‌ها */}
        {skillsArray.length > 0 && (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text>مهارت‌ها</Text>
    </View>
    <View style={styles.sectionBody}>
      <View style={{
        ...styles.skillsContainer,
        direction: 'rtl',
        justifyContent: 'flex-start',
      }}>
        {skillsArray.map((skill, index) => (
          <Text key={index} style={{
            ...styles.skillTag,
            direction: 'rtl',
            textAlign: 'right',
          }}>
            {skill}
          </Text>
        ))}
      </View>
    </View>
  </View>
)}

        {/* لینک‌ها */}
        {(candidate.linkedinUrl || candidate.portfolioUrl) && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text>لینک‌های مفید</Text>
            </View>
            <View style={styles.sectionBody}>
              <View style={styles.grid2}>
                {candidate.linkedinUrl && (
                  <View style={styles.gridItemFull}>
                    <Text style={styles.label}>لینکدین</Text>
                    <Text style={styles.valueSmall}>{candidate.linkedinUrl}</Text>
                  </View>
                )}
                {candidate.portfolioUrl && (
                  <View style={styles.gridItemFull}>
                    <Text style={styles.label}>نمونه‌کار</Text>
                    <Text style={styles.valueSmall}>{candidate.portfolioUrl}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* متن معرفی */}
        {candidate.coverLetter && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text>متن معرفی</Text>
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.coverLetter}>{candidate.coverLetter}</Text>
            </View>
          </View>
        )}

        {/* یادداشت‌ها */}
        {candidate.notes && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text>یادداشت‌ها</Text>
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.coverLetter}>{candidate.notes}</Text>
            </View>
          </View>
        )}

        {/* فوتر */}
        <View style={styles.footer}>
          <Text>تاریخ ایجاد: {new Date().toLocaleDateString('fa-IR')}</Text>
          <Text style={{ marginTop: 2 }}>کد کاندیدا: {candidate.id}</Text>
        </View>
      </Page>
    </Document>
  )
}