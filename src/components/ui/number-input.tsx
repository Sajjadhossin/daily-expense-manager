import * as React from "react"
import { cn } from "@/lib/utils"

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 flex items-center justify-center text-surface-400 dark:text-surface-500 pointer-events-none text-xl font-medium">
            ৳
          </div>
          <input
            type="number"
            step="0.01"
            onWheel={(e) => (e.target as HTMLInputElement).blur()}
            className={cn(
              "flex h-16 w-full rounded-2xl border bg-surface-50 dark:bg-surface-900/50 pl-11 pr-4 py-2 text-2xl font-bold tabular-nums text-surface-900 dark:text-surface-50 placeholder:text-surface-300 dark:placeholder:text-surface-600 transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
              error
                ? "border-expense-500 focus-visible:ring-expense-500 text-expense-600 dark:text-expense-400"
                : "border-surface-200 dark:border-surface-800 focus-visible:ring-primary-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-expense-500 font-medium px-1">
            {error}
          </p>
        )}
      </div>
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }
