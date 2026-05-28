'use client'

import { useRef } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import {
  CalendarOff, MapPin, FileText, CreditCard,
  CheckCircle2, XCircle, ClipboardList,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card'
import { Button } from '@/core/components/ui/Button'
import { Badge } from '@/core/components/ui/badge'
import { toPersianDigits } from '@/core/lib/utils-fa'
import { showToast } from '../lib/toast'

interface PendingCounts {
  leaves: number
  missions: number
  loans: number
  contracts: number
}

const PENDING_COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  blue: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
}

function PendingItem({
  icon: Icon,
  label,
  count,
  color,
  onApprove,
  onReject,
  delay = 0,
  isInView,
}: {
  icon: React.ElementType
  label: string
  count: number
  color: string
  onApprove: () => void
  onReject: () => void
  delay?: number
  isInView: boolean
}) {
  if (count === 0) return null

  return (
    <motion.div
      className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-muted/50 transition-colors"
      initial={{ opacity: 0, x: 30, scale: 0.97 }}
      animate={isInView ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: 30, scale: 0.97 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: -3, backgroundColor: 'rgba(0,0,0,0.03)' }}
    >
      <div className="flex items-center gap-3">
        <motion.div
          className={`p-2 rounded-lg ${PENDING_COLOR_MAP[color]}`}
          initial={{ scale: 0, rotate: -90 }}
          animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -90 }}
          transition={{ duration: 0.35, delay: delay + 0.1, type: 'spring', stiffness: 250, damping: 15 }}
        >
          <Icon className="w-4 h-4" />
        </motion.div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : { scale: 0 }}
            transition={{ duration: 0.3, delay: delay + 0.2, type: 'spring', stiffness: 300 }}
          >
            <Badge variant="secondary" className="text-xs">
              {toPersianDigits(count)}
            </Badge>
          </motion.div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
            onClick={onApprove}
          >
            <CheckCircle2 className="w-4 h-4" />
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={onReject}
          >
            <XCircle className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}

export function PendingRequestsCard({
  pending,
  onRefresh,
}: {
  pending: PendingCounts
  onRefresh: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-40px' })

  const total = pending.leaves + pending.missions + pending.loans

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.96, filter: 'blur(4px)' }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } : { opacity: 0, y: 30, scale: 0.96, filter: 'blur(4px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <motion.div
                className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30"
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ duration: 0.4, delay: 0.15, type: 'spring', stiffness: 200 }}
              >
                <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </motion.div>
              درخواست‌های در انتظار تایید
            </CardTitle>
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ duration: 0.3, delay: 0.3, type: 'spring', stiffness: 300 }}
            >
              <Badge variant="outline" className="text-xs">
                مجموع {toPersianDigits(total)}
              </Badge>
            </motion.div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1">
          <AnimatePresence mode="popLayout">
            <PendingItem
              key="pending-leaves"
              icon={CalendarOff}
              label="مرخصی"
              count={pending.leaves}
              color="purple"
              delay={0.1}
              isInView={isInView}
              onApprove={async () => {
                try {
                  const res = await fetch('/api/leaves?status=pending&limit=1')
                  const json = await res.json()
                  if (json.data?.[0]?.id) {
                    await fetch(`/api/leaves/${json.data[0].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) })
                    showToast.success('مرخصی تایید شد')
                    onRefresh()
                  } else {
                    showToast.info('درخواست مرخصی در انتظاری یافت نشد')
                  }
                } catch { showToast.error('خطا در تایید مرخصی') }
              }}
              onReject={async () => {
                try {
                  const res = await fetch('/api/leaves?status=pending&limit=1')
                  const json = await res.json()
                  if (json.data?.[0]?.id) {
                    await fetch(`/api/leaves/${json.data[0].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) })
                    showToast.warning('مرخصی رد شد')
                    onRefresh()
                  } else {
                    showToast.info('درخواست مرخصی در انتظاری یافت نشد')
                  }
                } catch { showToast.error('خطا در رد مرخصی') }
              }}
            />
            <PendingItem
              key="pending-missions"
              icon={MapPin}
              label="ماموریت"
              count={pending.missions}
              color="blue"
              delay={0.18}
              isInView={isInView}
              onApprove={async () => {
                try {
                  const res = await fetch('/api/missions?status=pending&limit=1')
                  const json = await res.json()
                  if (json.data?.[0]?.id) {
                    await fetch(`/api/missions/${json.data[0].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) })
                    showToast.success('ماموریت تایید شد')
                    onRefresh()
                  } else {
                    showToast.info('درخواست ماموریت در انتظاری یافت نشد')
                  }
                } catch { showToast.error('خطا در تایید ماموریت') }
              }}
              onReject={async () => {
                try {
                  const res = await fetch('/api/missions?status=pending&limit=1')
                  const json = await res.json()
                  if (json.data?.[0]?.id) {
                    await fetch(`/api/missions/${json.data[0].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) })
                    showToast.warning('ماموریت رد شد')
                    onRefresh()
                  } else {
                    showToast.info('درخواست ماموریت در انتظاری یافت نشد')
                  }
                } catch { showToast.error('خطا در رد ماموریت') }
              }}
            />
            <PendingItem
              key="pending-loans"
              icon={CreditCard}
              label="وام و مساعده"
              count={pending.loans}
              color="emerald"
              delay={0.26}
              isInView={isInView}
              onApprove={async () => {
                try {
                  const res = await fetch('/api/loans?status=pending&limit=1')
                  const json = await res.json()
                  if (json.data?.[0]?.id) {
                    await fetch(`/api/loans/${json.data[0].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'approved' }) })
                    showToast.success('وام تایید شد')
                    onRefresh()
                  } else {
                    showToast.info('درخواست وام در انتظاری یافت نشد')
                  }
                } catch { showToast.error('خطا در تایید وام') }
              }}
              onReject={async () => {
                try {
                  const res = await fetch('/api/loans?status=pending&limit=1')
                  const json = await res.json()
                  if (json.data?.[0]?.id) {
                    await fetch(`/api/loans/${json.data[0].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'rejected' }) })
                    showToast.warning('وام رد شد')
                    onRefresh()
                  } else {
                    showToast.info('درخواست وام در انتظاری یافت نشد')
                  }
                } catch { showToast.error('خطا در رد وام') }
              }}
            />
            <PendingItem
              key="pending-contracts"
              icon={FileText}
              label="قرارداد / حکم"
              count={pending.contracts}
              color="amber"
              delay={0.34}
              isInView={isInView}
              onApprove={async () => {
                try {
                  const res = await fetch('/api/contracts?status=draft&limit=1')
                  const json = await res.json()
                  if (json.data?.[0]?.id) {
                    await fetch(`/api/contracts/${json.data[0].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve' }) })
                    showToast.success('قرارداد تایید شد')
                    onRefresh()
                  } else {
                    showToast.info('قرارداد در انتظاری یافت نشد')
                  }
                } catch { showToast.error('خطا در تایید قرارداد') }
              }}
              onReject={async () => {
                try {
                  const res = await fetch('/api/contracts?status=draft&limit=1')
                  const json = await res.json()
                  if (json.data?.[0]?.id) {
                    await fetch(`/api/contracts/${json.data[0].id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'terminated' }) })
                    showToast.warning('قرارداد رد شد')
                    onRefresh()
                  } else {
                    showToast.info('قرارداد در انتظاری یافت نشد')
                  }
                } catch { showToast.error('خطا در رد قرارداد') }
              }}
            />
          </AnimatePresence>
          
          {(total === 0) && (
            <motion.div
              key="pending-empty-state"
              className="text-center py-8 text-muted-foreground text-sm"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
              </motion.div>
              همه درخواست‌ها بررسی شده‌اند
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}