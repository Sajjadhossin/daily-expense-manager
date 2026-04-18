"use client"

import * as React from "react"
import { Check, ChevronDown, Search, Plus, Loader2 } from "lucide-react"
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
  onCreateNew?: (name: string) => Promise<string | undefined>
  createNewLabel?: string
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
  onCreateNew,
  createNewLabel = "Create new category",
}: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [isCreating, setIsCreating] = React.useState(false)
  const [newName, setNewName] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const newNameInputRef = React.useRef<HTMLInputElement>(null)

  const selectedOption = React.useMemo(() => {
    return options.find((opt) => opt.value === value)
  }, [value, options])

  const handleStartCreate = () => {
    setIsCreating(true)
    setNewName("")
    setTimeout(() => newNameInputRef.current?.focus(), 50)
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
    setNewName("")
  }

  const handleSubmitCreate = async () => {
    if (!newName.trim() || !onCreateNew) return
    setIsSubmitting(true)
    try {
      const newId = await onCreateNew(newName.trim())
      if (newId) {
        onChange(newId)
      }
      setIsCreating(false)
      setNewName("")
      setOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full relative">
      <PopoverPrimitive.Root open={open} onOpenChange={(o) => { setOpen(o); if (!o) handleCancelCreate(); }}>
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
            {isCreating ? (
              <div className="p-3 space-y-3">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-50">New Category</p>
                <input
                  ref={newNameInputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSubmitCreate()
                    if (e.key === 'Escape') handleCancelCreate()
                  }}
                  placeholder="Category name..."
                  className="w-full h-10 px-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-sm text-surface-900 dark:text-surface-50 placeholder:text-surface-400 outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelCreate}
                    className="flex-1 h-9 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitCreate}
                    disabled={!newName.trim() || isSubmitting}
                    className="flex-1 h-9 rounded-lg text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Create
                  </button>
                </div>
              </div>
            ) : (
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
                        value={option.label}
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
                {onCreateNew && (
                  <div className="border-t border-surface-200 dark:border-surface-800 p-1">
                    <button
                      onClick={handleStartCreate}
                      className="w-full flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      {createNewLabel}
                    </button>
                  </div>
                )}
              </Command>
            )}
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
