import { NextRequest, NextResponse } from 'next/server'
import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import reshaper from 'arabic-reshaper'
import bidiFactory from 'bidi-js'
import path from 'path'
import fs from 'fs'

const bidi = bidiFactory('')

const prepareRTL = (text: string): string => {
  if (!text?.trim()) return text
  const reshaped = reshaper.convertArabic(text)
  const levels = bidi.getEmbeddingLevels(reshaped, 'rtl')
  return bidi.getReorderedString(reshaped, levels)
}

const toPD = (n: number) => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[+d])
const fmtDate = (d: string) => {
  if (!d) return ''
  const p = d.split('/')
  return p.length === 3 ? `${toPD(+p[0])}/${toPD(+p[1])}/${toPD(+p[2])}` : d
}
const typeMap: Record<string, string> = {
  permanent: 'دائم', temporary: 'موقت', official: 'دائم',
  contractual: 'قراردادی', hourly: 'ساعتی', part_time: 'پاره‌وقت',
  full_time: 'تمام‌وقت', contract: 'قراردادی', freelance: 'آزاد',
}

async function buildPDF(contract: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)

  const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Vazirmatn-Regular.ttf')
  const fontBytes = fs.readFileSync(fontPath)
  const font = await pdfDoc.embedFont(fontBytes)

  const W = 595, H = 842, ML = 50, MR = 50
  const RIGHT = W - MR, CW = W - ML - MR
  const C_PRIMARY = rgb(0.03, 0.4, 0.27)
  const C_GRAY = rgb(0.4, 0.4, 0.4)
  const C_DARK = rgb(0.1, 0.1, 0.1)
  const C_BG = rgb(0.95, 0.98, 0.96)
  const C_BORDER = rgb(0.8, 0.8, 0.8)

  const drawRTL = (page: any, text: string, y: number, size: number, color: any, rightEdge = RIGHT) => {
    const p = prepareRTL(text)
    const w = font.widthOfTextAtSize(p, size)
    page.drawText(p, { x: rightEdge - w, y, size, font, color })
  }

  const drawCenter = (page: any, text: string, y: number, size: number, color: any) => {
    const p = prepareRTL(text)
    const w = font.widthOfTextAtSize(p, size)
    page.drawText(p, { x: W / 2 - w / 2, y, size, font, color })
  }

  const wrapLine = (text: string, fontSize: number, maxWidth: number): string[] => {
    const words = text.trim().split(' ')
    const lines: string[] = []
    let current = ''
    for (const word of words) {
      const test = current ? `${current} ${word}` : word
      if (font.widthOfTextAtSize(prepareRTL(test), fontSize) > maxWidth && current) {
        lines.push(current)
        current = word
      } else {
        current = test
      }
    }
    if (current) lines.push(current)
    return lines
  }

  let page = pdfDoc.addPage([W, H])
  let y = H - 50

  drawCenter(page, 'قرارداد', y, 20, C_PRIMARY); y -= 28
  drawCenter(page, 'سازمان مدیریت منابع انسانی', y, 10, C_GRAY); y -= 30
  page.drawLine({ start: { x: ML, y }, end: { x: RIGHT, y }, color: C_PRIMARY, thickness: 2 }); y -= 25

  drawRTL(page, 'اطلاعات قرارداد', y, 12, C_PRIMARY); y -= 16

  const employeeName = `${contract.employee?.firstName || ''} ${contract.employee?.lastName || ''}`.trim() || '-'
  const infoRows: [string, string][] = [
    ['شماره قرارداد:', contract.contractNumber || '-'],
    ['کارمند:', employeeName],
    ['نوع قرارداد:', typeMap[contract.type] || contract.type],
    ['تاریخ شروع:', fmtDate(contract.startDate)],
    ['تاریخ پایان:', contract.endDate ? fmtDate(contract.endDate) : 'نامحدود'],
  ]

  const INFO_H = infoRows.length * 22 + 14
  page.drawRectangle({ x: ML, y: y - INFO_H, width: CW, height: INFO_H, color: C_BG })
  page.drawRectangle({ x: ML, y: y - INFO_H, width: CW, height: INFO_H, borderColor: C_BORDER, borderWidth: 1 })

  let ry = y - 14
  for (const [label, value] of infoRows) {
    drawRTL(page, label, ry, 10, C_GRAY, RIGHT - 12)
    const lw = font.widthOfTextAtSize(prepareRTL(label), 10)
    const vp = prepareRTL(value)
    const vw = font.widthOfTextAtSize(vp, 10)
    page.drawText(vp, { x: RIGHT - 12 - lw - 8 - vw, y: ry, size: 10, font, color: C_DARK })
    ry -= 22
  }
  y = y - INFO_H - 25

  drawRTL(page, 'متن قرارداد', y, 12, C_PRIMARY); y -= 16

  if (contract.content) {
    const allLines: string[] = []
    for (const line of contract.content.split('\n')) {
      const t = line.trim()
      if (!t) { allLines.push(''); continue }
      allLines.push(...wrapLine(t, 9, CW - 20))
    }

    for (const line of allLines) {
      if (y < 150) {
        page = pdfDoc.addPage([W, H])
        y = H - 50
        drawRTL(page, 'ادامه متن قرارداد', y, 10, C_PRIMARY); y -= 20
      }
      if (!line) { y -= 8; continue }
      drawRTL(page, line, y, 9, C_DARK, RIGHT - 10)
      y -= 18
    }
  }

  y -= 20

  if (y < 160) { page = pdfDoc.addPage([W, H]); y = H - 50 }
  page.drawLine({ start: { x: ML, y: y + 15 }, end: { x: RIGHT, y: y + 15 }, color: C_BORDER, thickness: 1 })
  y -= 5

  const sigs = ['کارمند', 'مدیر واحد', 'مدیر منابع انسانی']
  const sigFields = ['نام: ..................', 'امضاء: ..................', 'تاریخ: ..../..../....']
  const sigW = CW / 3

  for (let i = 0; i < sigs.length; i++) {
    const colCenter = RIGHT - i * sigW - sigW / 2
    const tp = prepareRTL(sigs[i])
    page.drawText(tp, { x: colCenter - font.widthOfTextAtSize(tp, 11) / 2, y: y + 8, size: 11, font, color: C_DARK })
    let fy = y - 8
    for (const f of sigFields) {
      const fp = prepareRTL(f)
      page.drawText(fp, { x: colCenter - font.widthOfTextAtSize(fp, 9) / 2, y: fy, size: 9, font, color: C_GRAY })
      fy -= 16
    }
  }

  const f1 = prepareRTL('این سند به صورت دیجیتال صادر شده و بدون مهر و امضاء معتبر می‌باشد.')
  page.drawText(f1, { x: W / 2 - font.widthOfTextAtSize(f1, 8) / 2, y: 40, size: 8, font, color: rgb(0.6, 0.6, 0.6) })
  const f2 = prepareRTL(`کد پیگیری: ${contract.contractNumber || ''}`)
  page.drawText(f2, { x: W / 2 - font.widthOfTextAtSize(f2, 8) / 2, y: 25, size: 8, font, color: rgb(0.6, 0.6, 0.6) })

  return await pdfDoc.save()
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const baseUrl = req.nextUrl.origin
    const res = await fetch(`${baseUrl}/api/contracts/${id}`)
    if (!res.ok) return NextResponse.json({ error: 'قرارداد یافت نشد' }, { status: 404 })

    const data = await res.json()
    const contract = data.data || data

    const pdfBytes = await buildPDF(contract)

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="contract-${id}.pdf"`,
      },
    })
  } catch (err) {
    console.error('PDF generation error:', err)
    return NextResponse.json({ error: 'خطا در تولید PDF' }, { status: 500 })
  }
}
