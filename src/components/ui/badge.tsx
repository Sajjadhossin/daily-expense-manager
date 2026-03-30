import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-surface-900 text-surface-50 hover:bg-surface-800 dark:bg-surface-50 dark:text-surface-900 dark:hover:bg-surface-200",
        primary:
          "border-transparent bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300",
        secondary:
          "border-transparent bg-surface-100 text-surface-900 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-50 dark:hover:bg-surface-700",
        outline: "text-surface-900 dark:text-surface-50 border-surface-200 dark:border-surface-800",
        income:
          "border-transparent bg-income-100 text-income-700 dark:bg-income-900/30 dark:text-income-400",
        expense:
          "border-transparent bg-expense-100 text-expense-700 dark:bg-expense-900/30 dark:text-expense-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
