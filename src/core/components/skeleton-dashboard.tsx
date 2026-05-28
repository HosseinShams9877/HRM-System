'use client'

import { cn } from '@/core/lib/utils'

/** Shimmer animation overlay */
function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'absolute inset-0 -translate-x-full',
        'bg-gradient-to-r from-transparent via-white/25 to-transparent',
        'animate-[shimmer_1.5s_ease-in-out_infinite]',
        className
      )}
    />
  )
}

/** Colored Stat Box Skeleton */
function StatBoxSkeleton({ index }: { index: number }) {
  const gradients = [
    'from-orange-500 via-orange-600 to-orange-700',
    'from-blue-600 via-indigo-600 to-indigo-700',
    'from-yellow-500 via-amber-500 to-amber-600',
    'from-rose-500 via-pink-600 to-red-600',
    'from-emerald-500 via-teal-600 to-cyan-600',
    'from-cyan-500 via-teal-600 to-emerald-600',
  ]

  const icons = ['📍', '👥', '⏰', '❌', '✅', '🧍']
  const labels = ['ماموریت', 'حاضر', 'تاخیر', 'غایب', 'مرخصی', 'کارکنان']

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl min-h-[180px] transition-all duration-500 opacity-0 animate-in fade-in slide-in-from-bottom-4',
        'bg-gradient-to-br shadow-lg',
        gradients[index % gradients.length],
        'cursor-default'
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'forwards' }}
    >
      <Shimmer />
      
      <div className="p-4 space-y-3 relative z-10">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl opacity-90">
              {icons[index]}
            </span>
            <div className="space-y-1.5">
              <div className="h-3 w-14 rounded-md bg-white/45" />
              <div className="h-2 w-[72px] rounded bg-white/30" />
            </div>
          </div>
          
          {/* Percentage badge placeholder */}
          <div className="w-7 h-7 rounded-full bg-white/25 backdrop-blur-sm" />
        </div>
        
        {/* Progress bar */}
        <div className="pt-1.5">
          <div className="h-1.5 rounded-full bg-white/20 w-full overflow-hidden">
            <div 
              className="h-full rounded-full bg-white/60 transition-all duration-1000"
              style={{ width: `${55 + (index * 5)}%` }}
            />
          </div>
        </div>

        {/* Name list placeholders */}
        <div className="space-y-1.5 pt-2">
          {[...Array(3)].map((_, i) => (
            <div 
              key={i} 
              className="flex items-center gap-2"
            >
              <div className="w-5 h-5 rounded-full bg-white/25 backdrop-blur-sm" />
              <div 
                className="h-2.5 rounded-md bg-white/20 flex-1" 
                style={{ width: `${58 + (i * 8)}%` }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Quick Actions Row Skeleton */
function QuickActionsSkeleton() {
  const actions = ['ثبت مرخصی', 'ثبت حضور', 'فیش حقوقی', 'کارمند جدید', 'ثبت ماموریت']
  
  return (
    <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-6 shadow-sm transition-all duration-500 opacity-0 animate-in fade-in slide-in-from-bottom-6"
      style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
    >
      <Shimmer />
      
      <div className="relative z-10">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/40 flex items-center justify-center">
            <div className="w-5 h-5 rounded bg-purple-500/20" />
          </div>
          <div className="h-5 w-[104px] rounded-lg bg-muted" />
        </div>
        
        {/* Action buttons grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {actions.map((action, i) => (
            <div
              key={action}
              className="flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border/60 bg-background/50 hover:bg-muted/30 transition-all duration-200 hover:scale-105"
              style={{ animationDelay: `${500 + i * 60}ms` }}
            >
              <div className="w-10 h-10 rounded-xl bg-muted/80" />
              <div className="h-3 w-16 rounded-md bg-muted/80 text-center" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Chart Card Skeleton */
function ChartSkeleton({ 
  height = 'h-[280px]', 
  delay = 0, 
  title = '',
  hasLegend = false 
}: { 
  height?: string; 
  delay?: number; 
  title?: string;
  hasLegend?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm transition-all duration-500 opacity-0 animate-in fade-in slide-in-from-bottom-4',
        height
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <Shimmer />
      
      <div className="p-5 space-y-4 relative z-10">
        {/* Card header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted/80" />
            <div className={cn('h-5 rounded-lg bg-muted/80', title ? 'w-36' : 'w-44')} />
          </div>
          {hasLegend && (
            <div className="flex gap-3">
              <div className="h-3 w-14 rounded bg-muted/60" />
              <div className="h-3 w-14 rounded bg-muted/60" />
            </div>
          )}
        </div>
        
        {/* Chart area placeholder */}
        <div className="space-y-3">
          <div className={cn(
            'rounded-xl bg-muted/50 flex items-end justify-around px-4 pb-4 pt-8 gap-2',
            height.includes('[300') ? 'h-[240px]' : height.includes('[320') ? 'h-[260px]' : 'h-[220px]'
          )}>
            {/* Fake chart bars/lines */}
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 max-w-[60px]">
                <div 
                  className="w-full rounded-t-lg bg-gradient-to-t from-primary/15 to-primary/30 transition-all duration-700"
                  style={{ 
                    height: `${28 + (i * 8)}%`,
                    animationDelay: `${delay + 600 + i * 80}ms`
                  }}
                />
                <div className="h-2 w-9 rounded bg-muted/70" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Empty State / No Data Skeleton */
function EmptyStateSkeleton({ message = '' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 mb-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20" />
      </div>
      <div className="h-4 w-32 rounded bg-muted mb-2" />
      {message && <div className="h-3 w-48 rounded bg-muted/70" />}
    </div>
  )
}

/** ===== MAIN EXPORT: Complete Dashboard Skeleton ===== */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* ROW 1: 6 Colored Stat Boxes */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <StatBoxSkeleton key={i} index={i} />
        ))}
      </div>

      {/* ROW 2: Quick Actions */}
      <QuickActionsSkeleton />

      {/* ROW 3: Charts Grid (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton delay={500} title="روند حضور" hasLegend />
        <ChartSkeleton delay={600} title="درخواست‌های در انتظار" />
      </div>

      {/* ROW 4: KPI + Alerts + Salary (3 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartSkeleton height="h-[300px]" delay={700} title="KPI" hasLegend />
        
        {/* Alerts card skeleton (taller) */}
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm h-[350px] transition-all duration-500 opacity-0 animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: '800ms', animationFillMode: 'forwards' }}
        >
          <Shimmer />
          <div className="p-5 space-y-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/30" />
              <div className="h-5 w-32 rounded-lg bg-muted/80" />
            </div>
            <div className="space-y-2.5 pt-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <div className="w-4 h-4 rounded bg-muted/60" />
                  <div className="h-3 flex-1 rounded bg-muted/50" style={{ width: `${65 + (i * 5)}%` }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <ChartSkeleton height="h-[320px]" delay={900} title="حقوق و بیمه" />
      </div>

      {/* ROW 5: Recruitment Cards (2 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm p-6 h-36 transition-all duration-500 opacity-0 animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: '1000ms', animationFillMode: 'forwards' }}
        >
          <Shimmer />
          <div className="relative z-10 flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/30" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 rounded bg-muted/80" />
                <div className="h-7 w-14 rounded bg-muted/60" />
              </div>
            </div>
            <div className="h-9 w-20 rounded-lg bg-muted/60" />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm p-6 h-36 transition-all duration-500 opacity-0 animate-in fade-in slide-in-from-bottom-4"
          style={{ animationDelay: '1100ms', animationFillMode: 'forwards' }}
        >
          <Shimmer />
          <div className="relative z-10 flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-rose-100 dark:bg-rose-950/30" />
              <div className="space-y-1.5">
                <div className="h-4 w-24 rounded bg-muted/80" />
                <div className="h-7 w-14 rounded bg-muted/60" />
              </div>
            </div>
            <div className="h-9 w-20 rounded-lg bg-muted/60" />
          </div>
        </div>
      </div>
    </div>
  )
}

/** Individual component exports for reuse */
export { StatBoxSkeleton, QuickActionsSkeleton, ChartSkeleton, EmptyStateSkeleton }