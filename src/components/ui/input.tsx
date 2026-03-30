import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, icon, ...props }, ref) => {
    return (
      <div className="w-full relative">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-3 flex items-center justify-center text-surface-400 dark:text-surface-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-12 w-full rounded-xl border bg-surface-50 dark:bg-surface-900/50 px-3 py-2 text-sm text-surface-900 dark:text-surface-50 placeholder:text-surface-400 dark:placeholder:text-surface-500 transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
              icon ? "pl-10" : "",
              error 
                ? "border-expense-500 focus-visible:ring-expense-500" 
                : "border-surface-200 dark:border-surface-800 focus-visible:ring-primary-500",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-expense-500 font-medium">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
