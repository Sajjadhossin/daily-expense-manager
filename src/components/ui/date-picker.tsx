"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

interface DatePickerProps {
  value?: Date
  onChange: (date?: Date) => void
  disabled?: boolean
  error?: string
  className?: string
  placeholder?: string
}

export function DatePicker({
  value,
  onChange,
  disabled = false,
  error,
  className,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="w-full relative">
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-12 w-full items-center gap-3 rounded-xl border bg-surface-50 dark:bg-surface-900/50 px-3 py-2 text-sm text-surface-900 dark:text-surface-50 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 touch-target",
              error 
                ? "border-expense-500 focus:ring-expense-500" 
                : "border-surface-200 dark:border-surface-800 focus:ring-primary-500",
              !value && "text-surface-400 dark:text-surface-500",
              className
            )}
          >
            <CalendarIcon className="h-4 w-4 opacity-70 flex-shrink-0" />
            <span className="flex-1 truncate text-left">
              {value ? format(value, "PP") : placeholder}
            </span>
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 rounded-2xl border border-surface-200 bg-surface-50 p-3 text-surface-900 shadow-xl dark:border-surface-800 dark:bg-surface-900 dark:text-surface-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          >
            <DayPicker
              mode="single"
              selected={value}
              onSelect={(date) => {
                onChange(date)
                setOpen(false)
              }}
              className="p-1"
              classNames={{
                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-sm font-medium",
                nav: "space-x-1 flex items-center bg-transparent",
                nav_button: cn(
                  "h-8 w-8 bg-transparent p-0 flex items-center justify-center rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors",
                  "opacity-50 hover:opacity-100"
                ),
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex w-full mt-2",
                head_cell: "text-surface-500 dark:text-surface-400 rounded-md w-9 font-normal text-[0.8rem] text-center",
                row: "flex w-full mt-2",
                cell: "h-9 w-9 text-center text-sm p-0 m-0.5 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-surface-100/50 [&:has([aria-selected])]:bg-surface-100 dark:[&:has([aria-selected])]:bg-surface-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: cn(
                  "h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 cursor-pointer transition-colors"
                ),
                day_range_end: "day-range-end",
                day_selected:
                  "bg-primary-500 text-white hover:bg-primary-500 hover:text-white dark:bg-primary-500 dark:text-white dark:hover:bg-primary-500 dark:hover:text-white font-semibold",
                day_today: "bg-surface-100 dark:bg-surface-800/50 font-semibold",
                day_outside:
                  "day-outside text-surface-400 opacity-50 aria-selected:bg-surface-100/50 aria-selected:text-surface-500 aria-selected:opacity-30 dark:text-surface-500",
                day_disabled: "text-surface-400 opacity-50 dark:text-surface-600 cursor-not-allowed",
                day_hidden: "invisible",
              }}
              components={{
                IconLeft: () => <ChevronLeft className="h-4 w-4" />,
                IconRight: () => <ChevronRight className="h-4 w-4" />,
              }}
            />
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
      {error && (
        <p className="mt-1.5 text-xs text-expense-500 font-medium px-1">
          {error}
        </p>
      )}
    </div>
  )
}
