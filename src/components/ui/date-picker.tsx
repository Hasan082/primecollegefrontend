import * as React from "react"
import { format, setMonth, setYear, getMonth, getYear } from "date-fns"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  date?: Date
  onChange: (date?: Date) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  fromYear?: number
  toYear?: number
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

function CustomCalendar({
  selected,
  onSelect,
  fromYear = 1940,
  toYear = new Date().getFullYear(),
}: {
  selected?: Date
  onSelect: (date?: Date) => void
  fromYear?: number
  toYear?: number
}) {
  const [displayMonth, setDisplayMonth] = React.useState<Date>(
    selected ?? new Date()
  )

  const years = React.useMemo(() => {
    const result: number[] = []
    for (let y = toYear; y >= fromYear; y--) result.push(y)
    return result
  }, [fromYear, toYear])

  const handleMonthChange = (value: string) => {
    setDisplayMonth((prev) => setMonth(prev, parseInt(value)))
  }

  const handleYearChange = (value: string) => {
    setDisplayMonth((prev) => setYear(prev, parseInt(value)))
  }

  return (
    <div className="p-3">
      {/* Month / Year navigation */}
      <div className="flex items-center gap-2 mb-3">
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 shrink-0 opacity-70 hover:opacity-100"
          onClick={() =>
            setDisplayMonth((prev) => {
              const d = new Date(prev)
              d.setMonth(d.getMonth() - 1)
              return d
            })
          }
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-1 gap-1.5">
          <Select
            value={String(getMonth(displayMonth))}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-8 flex-1 text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i)} className="text-xs">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={String(getYear(displayMonth))}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-8 w-[80px] text-xs font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-52">
              {years.map((y) => (
                <SelectItem key={y} value={String(y)} className="text-xs">
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7 shrink-0 opacity-70 hover:opacity-100"
          onClick={() =>
            setDisplayMonth((prev) => {
              const d = new Date(prev)
              d.setMonth(d.getMonth() + 1)
              return d
            })
          }
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar grid */}
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        month={displayMonth}
        onMonthChange={setDisplayMonth}
        showOutsideDays
        classNames={{
          months: "flex flex-col",
          month: "space-y-2",
          caption: "hidden",
          table: "w-full border-collapse",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
          row: "flex w-full mt-1",
          cell: cn(
            "h-9 w-9 text-center text-sm p-0 relative",
            "[&:has([aria-selected].day-range-end)]:rounded-r-md",
            "[&:has([aria-selected].day-outside)]:bg-accent/50",
            "[&:has([aria-selected])]:bg-accent",
            "first:[&:has([aria-selected])]:rounded-l-md",
            "last:[&:has([aria-selected])]:rounded-r-md",
            "focus-within:relative focus-within:z-20",
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
        components={{
          IconLeft: () => <ChevronLeft className="h-4 w-4" />,
          IconRight: () => <ChevronRight className="h-4 w-4" />,
        }}
      />
    </div>
  )
}

export function DatePicker({
  date,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  fromYear = 1940,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CustomCalendar
          selected={date}
          onSelect={onChange}
          fromYear={fromYear}
          toYear={toYear}
        />
      </PopoverContent>
    </Popover>
  )
}
