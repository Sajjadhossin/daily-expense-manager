"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "cmdk"

import { cn } from "@/lib/utils"

interface SelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
  error?: string
}

export function Select({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled = false,
  error,
}: SelectProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value)
  }, [value, options])

  return (
    <div className="w-full relative">
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger asChild>
          <button
            type="button"
            disabled={disabled}
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-xl border bg-surface-50 dark:bg-surface-900/50 px-3 py-2 text-sm text-surface-900 dark:text-surface-50 placeholder:text-surface-400 dark:placeholder:text-surface-500 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 touch-target",
              error 
                ? "border-expense-500 focus:ring-expense-500" 
                : "border-surface-200 dark:border-surface-800 focus:ring-primary-500",
              className
            )}
          >
            <div className="flex items-center gap-2 truncate">
              {selectedOption?.icon && (
                <span className="text-surface-500 dark:text-surface-400 flex-shrink-0">
                  {selectedOption.icon}
                </span>
              )}
              <span className={!selectedOption ? "text-surface-400 dark:text-surface-500" : ""}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="start"
            sideOffset={4}
            className="z-50 w-[var(--radix-popover-trigger-width)] min-w-[200px] overflow-hidden rounded-xl border border-surface-200 bg-surface-50 p-0 text-surface-900 shadow-xl dark:border-surface-800 dark:bg-surface-900 dark:text-surface-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
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
                  {options.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.label} // Note: cmdk filters by the value string, so passing label here makes it searchable by label
                      onSelect={() => {
                        onChange(option.value)
                        setOpen(false)
                      }}
                      className={cn(
                        "relative flex cursor-default select-none items-center rounded-lg px-2 py-2.5 text-sm outline-none transition-colors aria-selected:bg-surface-100 aria-selected:text-surface-900 dark:aria-selected:bg-surface-800 dark:aria-selected:text-surface-50 data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50 touch-target",
                        value === option.value && "bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-surface-50 font-medium"
                      )}
                    >
                      {option.icon && (
                        <span className="mr-2 text-surface-500 dark:text-surface-400">
                          {option.icon}
                        </span>
                      )}
                      <span className="flex-1 truncate">{option.label}</span>
                      {value === option.value && (
                        <Check className="ml-auto h-4 w-4 text-primary-600 dark:text-primary-400" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
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
