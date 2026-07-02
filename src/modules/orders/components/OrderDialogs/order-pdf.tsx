// src/modules/orders/components/OrderDialogs/order-pdf.tsx
import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'

// ثبت فونت
Font.register({
  family: 'Vazirmatn',
  src: '/fonts/Vazirmatn-Regular.ttf',
  fontWeight: 400,
})

Font.register({
  family: 'Vazirmatn',
  src: '/fonts/Vazirmatn-Bold.ttf',
  fontWeight: 700,
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Vazirmatn',
    direction: 'rtl',
  },
  header: {
    textAlign: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#059669',
    borderBottomStyle: 'solid',
    paddingBottom: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#065f46',
    textAlign: 'center',
  },
  headerSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  metaItem: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    textAlign: 'center',
  },
  metaItemStrong: {
    color: '#059669',
    fontWeight: 700,
  },
  titleBox: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderStyle: 'solid',
  },
  titleText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 700,
    color: '#065f46',
  },
  titleSub: {
    textAlign: 'center',
    fontSize: 12,
    color: '#059669',
    marginTop: 4,
  },
  section: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    backgroundColor: '#ecfdf5',
    padding: 8,
    fontWeight: 700,
    fontSize: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
    textAlign: 'center', // وسط‌چین
  },
  sectionBody: {
    padding: 16,
  },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#f9fafb',
    padding: 8,
    borderRadius: 6,
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
  },
  value: {
    fontSize: 13,
    fontWeight: 600,
    color: '#111827',
    marginTop: 2,
    textAlign: 'right',
  },
  changeBox: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderStyle: 'solid',
    padding: 8,
    borderRadius: 6,
    width: '48%',
  },
  changeLabel: {
    fontSize: 10,
    color: '#b45309',
    textAlign: 'right',
  },
  changeValue: {
    fontSize: 13,
    fontWeight: 600,
    color: '#92400e',
    marginTop: 2,
    textAlign: 'right',
  },
  legalBox: {
    backgroundColor: '#eff6ff',
    borderRightWidth: 4,
    borderRightColor: '#3b82f6',
    borderRightStyle: 'solid',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  legalText: {
    fontSize: 12,
    lineHeight: 1.8,
    color: '#1e293b',
    textAlign: 'justify',
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    marginTop: 16,
  },
  signatureBox: {
    textAlign: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    flex: 1,
  },
  signatureTitle: {
    fontWeight: 700,
    marginBottom: 16,
    fontSize: 13,
    textAlign: 'center',
  },
  signatureText: {
    fontSize: 11,
    color: '#4b5563',
    marginVertical: 4,
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    fontSize: 10,
    color: '#9ca3af',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    marginTop: 16,
  },
  description: {
    fontSize: 12,
    lineHeight: 1.8,
    color: '#1a1a1a',
    padding: 8,
    textAlign: 'justify',
  },
})

interface OrderPDFProps {
  order: OrderRecord
  employee: any
  displayOrder: any
  hasPositionChange: boolean
  hasSalaryChange: boolean
  orderTypeLabels: Record<string, string>
  formatShamsi: (date: string) => string
  formatCurrency: (amount: number) => string
  toPersianDigits: (num: string) => string
}

export function OrderPDF({
  order,
  employee,
  displayOrder,
  hasPositionChange,
  hasSalaryChange,
  orderTypeLabels,
  formatShamsi,
  formatCurrency,
  toPersianDigits,
}: OrderPDFProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* هدر */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>حکم کارگزینی</Text>
          <Text style={styles.headerSub}>سازمان مدیریت منابع انسانی</Text>
          <View style={styles.metaContainer}>
            <Text style={styles.metaItem}>
              شماره: <Text style={styles.metaItemStrong}>{toPersianDigits(displayOrder.orderNumber)}</Text>
            </Text>
            <Text style={styles.metaItem}>
              تاریخ صدور: <Text style={styles.metaItemStrong}>{formatShamsi(displayOrder.issueDate)}</Text>
            </Text>
            <Text style={styles.metaItem}>
              تاریخ اجرا: <Text style={styles.metaItemStrong}>{formatShamsi(displayOrder.effectiveDate)}</Text>
            </Text>
          </View>
        </View>

        {/* عنوان حکم - وسط‌چین */}
        <View style={styles.titleBox}>
          <Text style={styles.titleText}>{displayOrder.title}</Text>
          <Text style={styles.titleSub}>
            {orderTypeLabels[displayOrder.orderType] || displayOrder.orderType}
          </Text>
        </View>

        {/* مشخصات کارمند */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text>مشخصات کارمند</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.grid2}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>نام و نام خانوادگی</Text>
                <Text style={styles.value}>{employee.firstName} {employee.lastName}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>کد پرسنلی</Text>
                <Text style={styles.value}>{toPersianDigits(employee.personnelCode)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>کد ملی</Text>
                <Text style={styles.value}>{toPersianDigits(employee.nationalCode || '—')}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>نام پدر</Text>
                <Text style={styles.value}>{employee.fatherName || '—'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>تاریخ تولد</Text>
                <Text style={styles.value}>{formatShamsi(employee.birthDate || '')}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>شماره موبایل</Text>
                <Text style={styles.value}>{toPersianDigits(employee.phone || '—')}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>وضعیت تأهل</Text>
                <Text style={styles.value}>{employee.maritalStatus === 'married' ? 'متاهل' : 'مجرد'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>تاریخ شروع همکاری</Text>
                <Text style={styles.value}>{formatShamsi(employee.hireDate || '')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* اطلاعات شغلی */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text>اطلاعات شغلی</Text>
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.grid2}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>سمت</Text>
                <Text style={styles.value}>{employee.positionName || employee.position || '—'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>واحد سازمانی</Text>
                <Text style={styles.value}>{employee.departmentName || employee.department || '—'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>نوع قرارداد</Text>
                <Text style={styles.value}>{employee.contractType || '—'}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>نوع حکم</Text>
                <Text style={styles.value}>{orderTypeLabels[displayOrder.orderType] || displayOrder.orderType}</Text>
              </View>
              {hasPositionChange && (
                <>
                  <View style={styles.changeBox}>
                    <Text style={styles.changeLabel}>سمت جدید</Text>
                    <Text style={styles.changeValue}>
                      {displayOrder.newPositionName || displayOrder.newPosition || '—'}
                    </Text>
                  </View>
                  <View style={styles.changeBox}>
                    <Text style={styles.changeLabel}>واحد جدید</Text>
                    <Text style={styles.changeValue}>
                      {displayOrder.newDepartmentName || displayOrder.newDepartment || '—'}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* اطلاعات حقوقی */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text>اطلاعات حقوقی</Text>
            {hasSalaryChange && (
              <Text style={{ backgroundColor: '#fbbf24', color: '#92400e', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, fontSize: 10 }}>
                تغییرات جدید
              </Text>
            )}
          </View>
          <View style={styles.sectionBody}>
            <View style={styles.grid2}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>حقوق پایه</Text>
                <Text style={styles.value}>
                  {hasSalaryChange && displayOrder.baseSalary ? (
                    `${formatCurrency(displayOrder.baseSalary)} (جدید)`
                  ) : (
                    formatCurrency(employee.baseSalary)
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>حق مسکن</Text>
                <Text style={styles.value}>
                  {hasSalaryChange && displayOrder.housingAllowance ? (
                    `${formatCurrency(displayOrder.housingAllowance)} (جدید)`
                  ) : (
                    formatCurrency(employee.housingAllowance)
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>بن کارگری</Text>
                <Text style={styles.value}>
                  {hasSalaryChange && displayOrder.foodAllowance ? (
                    `${formatCurrency(displayOrder.foodAllowance)} (جدید)`
                  ) : (
                    formatCurrency(employee.foodAllowance || employee.workAllowance)
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>حق جذب</Text>
                <Text style={styles.value}>
                  {hasSalaryChange && displayOrder.attractionAllowance ? (
                    `${formatCurrency(displayOrder.attractionAllowance)} (جدید)`
                  ) : (
                    formatCurrency(employee.attractionAllowance || employee.responsibilityAllowance)
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>حق مسئولیت</Text>
                <Text style={styles.value}>
                  {hasSalaryChange && displayOrder.responsibilityAllowance ? (
                    `${formatCurrency(displayOrder.responsibilityAllowance)} (جدید)`
                  ) : (
                    formatCurrency(employee.responsibilityAllowance)
                  )}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>سایر مزایا</Text>
                <Text style={styles.value}>
                  {hasSalaryChange && displayOrder.otherAllowances ? (
                    `${formatCurrency(displayOrder.otherAllowances)} (جدید)`
                  ) : (
                    formatCurrency(employee.otherAllowances)
                  )}
                </Text>
              </View>
              <View style={[styles.gridItem, { width: '100%' }]}>
                <Text style={styles.label}>کسورات ثابت</Text>
                <Text style={styles.value}>
                  {hasSalaryChange && displayOrder.fixedDeductions ? (
                    `${formatCurrency(displayOrder.fixedDeductions)} (جدید)`
                  ) : (
                    formatCurrency(employee.fixedDeductions)
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* متن قانونی */}
        <View style={styles.legalBox}>
          <Text style={styles.legalText}>
            با توجه به تصمیمات و ضوابط مربوطه و با استفاده از قوانین به قوانین، بخش آیین‌نامه‌ها و مقررات تاریخ اجرای حکم، موارد مندرج در این حکم کارگزینی به عنوان مبنای محاسبات حقوق و مزایا و سایر تعهدات و مسئولیت‌های مالی در شرکت ملک عمل قرار گیرد.
          </Text>
        </View>

        {/* شرح وظایف */}
        {displayOrder.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text>شرح وظایف</Text>
            </View>
            <View style={styles.sectionBody}>
              <Text style={styles.description}>{displayOrder.description}</Text>
            </View>
          </View>
        )}

        {/* توضیحات */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text>توضیحات</Text>
          </View>
          <View style={styles.sectionBody}>
            <Text style={styles.description}>
              این حکم اجرایی حکم جدید بوده و تاریخ صدور و تاریخ اجرای حکم معتبر می‌باشد. هرگونه تغییر در مفاد این حکم صرفاً با مجوز کتبی مدیرعامل مقام مجاز امکان پذیر است.
            </Text>
          </View>
        </View>

        {/* امضاها */}
        <View style={styles.signatures}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>کارمند</Text>
            <Text style={styles.signatureText}>نام و نام خانوادگی: ....................</Text>
            <Text style={styles.signatureText}>امضاء: ....................</Text>
            <Text style={styles.signatureText}>تاریخ: ....../....../......</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>مدیر واحد</Text>
            <Text style={styles.signatureText}>نام و نام خانوادگی: ....................</Text>
            <Text style={styles.signatureText}>امضاء: ....................</Text>
            <Text style={styles.signatureText}>تاریخ: ....../....../......</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureTitle}>مدیر منابع انسانی</Text>
            <Text style={styles.signatureText}>نام و نام خانوادگی: ....................</Text>
            <Text style={styles.signatureText}>امضاء: ....................</Text>
            <Text style={styles.signatureText}>تاریخ: ....../....../......</Text>
          </View>
        </View>

        {/* فوتر */}
        <View style={styles.footer}>
          <Text>این سند به صورت دیجیتال صادر شده و بدون مهر و امضاء معتبر می‌باشد.</Text>
          <Text style={{ marginTop: 4 }}>کد پیگیری: {toPersianDigits(displayOrder.orderNumber)}</Text>
        </View>
      </Page>
    </Document>
  )
}