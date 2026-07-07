// src/modules/recruitment/components/PipelineTab.tsx
'use client'

import { Building2, Briefcase, Users } from 'lucide-react'
import { Badge } from '@/core/components/ui/badge'
import { STATUS_MAP, PIPELINE_COLUMNS } from './recruitment-module'
import { toPersianDigits } from '@/core/lib/utils-fa'

interface Recruitment {
  id: string
  title: string
  department: string | null
  position: string | null
  status: string
  applicants: number
  createdAt: string
  updatedAt: string
}

export function PipelineTab({
  items, onEdit,
}: {
  items: Recruitment[]
  onEdit: (item: Recruitment) => void
}) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {PIPELINE_COLUMNS.map(statusKey => {
          const st = STATUS_MAP[statusKey]
          const columnItems = items.filter(i => i.status === statusKey)
          return (
            <div key={statusKey} className="flex-shrink-0 w-[260px]">
              <div className={`${st.headerBg} ${st.headerText} rounded-t-lg px-3 py-2.5 flex items-center justify-between`}>
                <span className="text-sm font-medium">{st.label}</span>
                <Badge className="bg-white/20 text-white border-0 text-[10px] hover:bg-white/30">
                  {toPersianDigits(columnItems.length)}
                </Badge>
              </div>
              <div className="bg-muted/30 dark:bg-muted/20 rounded-b-lg p-2 min-h-[300px] space-y-2">
                {columnItems.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground text-xs opacity-50">
                    موقعیتی وجود ندارد
                  </div>
                ) : (
                  columnItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-background rounded-lg p-3 shadow-sm border border-border/50 cursor-pointer hover:shadow-md hover:border-border transition-all"
                      onClick={() => onEdit(item)}
                    >
                      <h4 className="text-sm font-medium mb-1.5 truncate">{item.title}</h4>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          {item.department && (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {item.department}
                            </span>
                          )}
                        </div>
                        {item.applicants > 0 && (
                          <Badge variant="secondary" className="text-[9px] h-5 gap-1">
                            <Users className="w-2.5 h-2.5" />
                            {toPersianDigits(item.applicants)}
                          </Badge>
                        )}
                      </div>
                      {item.position && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <Briefcase className="w-3 h-3" />
                          {item.position}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}