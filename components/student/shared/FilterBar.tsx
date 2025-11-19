'use client'

import { Search, Filter, SortAsc } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterOption {
  label: string
  value: string
}

interface FilterBarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  filterOptions?: {
    label: string
    value: string
    options: FilterOption[]
    onChange: (value: string) => void
  }[]
  sortOptions?: {
    options: FilterOption[]
    value: string
    onChange: (value: string) => void
  }
  onReset?: () => void
}

export default function FilterBar({
  searchValue,
  onSearchChange,
  filterOptions = [],
  sortOptions,
  onReset
}: FilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      {/* Search */}
      <div className="relative flex-1 w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      {/* Filters */}
      {filterOptions.map((filter, index) => (
        <Select key={index} value={filter.value} onValueChange={filter.onChange}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder={filter.label} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {/* Sort */}
      {sortOptions && (
        <Select value={sortOptions.value} onValueChange={sortOptions.onChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SortAsc className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Reset */}
      {onReset && (
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  )
}
