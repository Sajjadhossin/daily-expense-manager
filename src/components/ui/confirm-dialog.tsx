import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./modal"
import { Button } from "./button"
import { TriangleAlert } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "default"
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !isLoading && !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {variant === "danger" && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-expense-100 dark:bg-expense-900/30 flex-shrink-0">
                <TriangleAlert className="w-5 h-5 text-expense-600 dark:text-expense-400" />
              </div>
            )}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className={variant === "danger" ? "mt-4 ml-13" : ""}>
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-6 flex gap-3 sm:gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="flex-1 sm:flex-none">
            {cancelText}
          </Button>
          <Button
            variant={variant === "danger" ? "destructive" : "default"}
            onClick={onConfirm}
            isLoading={isLoading}
            className="flex-1 sm:flex-none"
          >
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
