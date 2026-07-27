// modules/training/components/training-toolbar.tsx

import { Search, LayoutGrid, List } from 'lucide-react'
import { Input } from '@/core/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select'
import { Button } from '@/core/components/ui/button'
import { STATUS_MAP, CATEGORY_MAP } from '../constants'

interface TrainingToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  viewMode: 'card' | 'table'
  onViewModeChange: (mode: 'card' | 'table') => void
}

export function TrainingToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  viewMode,
  onViewModeChange,
}: TrainingToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="جستجو..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="h-8 w-[200px] text-xs pr-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه وضعیت‌ها</SelectItem>
            {Object.entries(STATUS_MAP).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
          <SelectTrigger className="h-8 w-[130px] text-xs">
            <SelectValue placeholder="دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه دسته‌ها</SelectItem>
            {Object.entries(CATEGORY_MAP).map(([key, val]) => (
              <SelectItem key={key} value={key}>{val.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1 border rounded-lg p-0.5">
        <Button
          variant={viewMode === 'card' ? 'default' : 'ghost'}
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onViewModeChange('card')}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant={viewMode === 'table' ? 'default' : 'ghost'}
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onViewModeChange('table')}
        >
          <List className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}