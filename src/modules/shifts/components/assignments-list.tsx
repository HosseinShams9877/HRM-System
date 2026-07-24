// components/Shifts/components/assignments-list.tsx

import { Avatar, AvatarFallback } from '@/core/components/ui/avatar'
import { Badge } from '@/core/components/ui/badge'
import { Button } from '@/core/components/ui/button'
import { Card, CardContent } from '@/core/components/ui/card'
import { UserCheck } from 'lucide-react'

interface Assignment {
  id: string
  employee: {
    id: string
    firstName: string
    lastName: string
    personnelCode: string
    department: string | null
  }
  shift: {
    id: string
    name: string
    color: string
    code: string
  }
  startDate: string
  endDate: string | null
  status: string
  isDefault: boolean
}

interface AssignmentsListProps {
  assignments: Assignment[]
  onEndAssignment: (id: string) => void
}

export function AssignmentsList({ assignments, onEndAssignment }: AssignmentsListProps) {
  if (assignments.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="py-16 text-center">
          <UserCheck className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-sm font-medium text-muted-foreground">
            انتسابی ثبت نشده
          </h3>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                کارمند
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                شیفت
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                تاریخ شروع
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                وضعیت
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr
                key={a.id}
                className="hover:bg-muted/50 transition-colors border-b last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-7 h-7">
                      <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-[9px] font-bold">
                        {a.employee.firstName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">
                      {a.employee.firstName} {a.employee.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: a.shift.color }}
                    />
                    <span className="text-xs">{a.shift.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-mono" dir="ltr">
                    {a.startDate}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    className={
                      a.status === 'active'
                        ? 'text-[10px] bg-emerald-100 text-emerald-700'
                        : 'text-[10px] bg-gray-100 text-gray-700'
                    }
                  >
                    {a.status === 'active' ? 'فعال' : 'پایان یافته'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {a.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-red-600 hover:text-red-700"
                      onClick={() => onEndAssignment(a.id)}
                    >
                      پایان
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}