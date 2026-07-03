"use client"

import * as React from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk"

import { cn } from "@/lib/utils"

interface MultiSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  /** Selected values. An empty array means "no filter" (all). */
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  /** Label shown in the trigger when nothing is selected. */
  allLabel?: string
  className?: string
  disabled?: boolean
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  allLabel = "All",
  className,
  disabled = false,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedSet = React.useMemo(() => new Set(value), [value])

  const toggle = (val: string) => {
    if (selectedSet.has(val)) {
      onChange(value.filter((v) => v !== val))
    } else {
      onChange([...value, val])
    }
  }

  const triggerLabel = React.useMemo(() => {
    if (value.length === 0) return allLabel
    if (value.length === 1) {
      return options.find((o) => o.value === value[0])?.label ?? "1 selected"
    }
    return `${value.length} selected`
  }, [value, options, allLabel])

  return (
    <div className="w-full relative">
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-xl border bg-surface-50 dark:bg-surface-900/50 px-3 py-2 text-sm text-surface-900 dark:text-surface-50 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 touch-target border-surface-200 dark:border-surface-800 focus:ring-primary-500",
              className
            )}
          >
            <span className={cn("truncate", value.length === 0 && "text-surface-400 dark:text-surface-500")}>
              {triggerLabel}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              {value.length > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Clear selection"
                  onClick={(e) => {
                    e.stopPropagation()
                    onChange([])
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.stopPropagation()
                      onChange([])
                    }
                  }}
                  className="rounded-md p-0.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-300 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] overflow-hidden rounded-xl border border-surface-200 bg-surface-50 p-0 text-surface-900 shadow-xl dark:border-surface-800 dark:bg-surface-900 dark:text-surface-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
          >
            <Command className="flex h-full w-full flex-col overflow-hidden bg-transparent">
              <div className="flex items-center border-b border-surface-200 dark:border-surface-800 px-3">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <CommandInput
                  placeholder={searchPlaceholder}
                  className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-surface-400 dark:placeholder:text-surface-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <CommandList className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                <CommandEmpty className="py-6 text-center text-sm text-surface-500 dark:text-surface-400">
                  {emptyText}
                </CommandEmpty>
                <CommandGroup className="p-1">
                  {options.map((option) => {
                    const checked = selectedSet.has(option.value)
                    return (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => toggle(option.value)}
                        className={cn(
                          "relative flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-2.5 text-sm outline-none transition-colors aria-selected:bg-surface-100 aria-selected:text-surface-900 dark:aria-selected:bg-surface-800 dark:aria-selected:text-surface-50 touch-target",
                          checked && "font-medium"
                        )}
                      >
                        <span
                          className={cn(
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
                            checked
                              ? "border-primary-600 bg-primary-600 text-white dark:border-primary-500 dark:bg-primary-500"
                              : "border-surface-300 dark:border-surface-600"
                          )}
                        >
                          {checked && <Check className="h-3 w-3" />}
                        </span>
                        {option.icon && (
                          <span className="text-surface-500 dark:text-surface-400">{option.icon}</span>
                        )}
                        <span className="flex-1 truncate">{option.label}</span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
              {value.length > 0 && (
                <div className="border-t border-surface-200 dark:border-surface-800 p-1">
                  <button
                    onClick={() => onChange([])}
                    className="w-full flex items-center justify-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Clear ({value.length})
                  </button>
                </div>
              )}
            </Command>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  )
}
