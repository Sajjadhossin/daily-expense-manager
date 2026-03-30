import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 touch-target active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "gradient-primary text-white hover:shadow-lg hover:shadow-primary-500/25",
        destructive:
          "bg-expense-500 text-white hover:bg-expense-600 hover:shadow-lg hover:shadow-expense-600/25",
        outline:
          "border-2 border-surface-200 bg-transparent hover:bg-surface-100 hover:text-surface-900 dark:border-surface-800 dark:hover:bg-surface-800 dark:hover:text-surface-50",
        secondary:
          "bg-surface-100 text-surface-900 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-50 dark:hover:bg-surface-700",
        ghost: "hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-surface-50",
        link: "text-primary-600 hover:underline dark:text-primary-400",
      },
      size: {
        default: "h-11 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
