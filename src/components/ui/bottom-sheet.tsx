import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  showCloseParams?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseParams = true,
}: BottomSheetProps) {
  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />

          {/* Sheet Element */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              // Close if dragged down sufficiently
              if (offset.y > 100 || velocity.y > 500) {
                onClose();
              }
            }}
            className={cn(
              "fixed bottom-0 left-0 right-0 z-50 rounded-t-[32px] bg-surface-50 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800 shadow-2xl p-6 pb-unsafe",
              className
            )}
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1.5rem)' }}
          >
            {/* Drag Handle */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 rounded-full bg-surface-300 dark:bg-surface-700 cursor-grab active:cursor-grabbing" />

            {/* Header */}
            {(title || showCloseParams) && (
              <div className="flex items-center justify-between mb-6 mt-4">
                {title ? (
                  <h2 className="text-xl font-bold text-surface-900 dark:text-surface-50">
                    {title}
                  </h2>
                ) : (
                  <div /> /* Spacer */
                )}

                {showCloseParams && (
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Content Container */}
            <div className="max-h-[70vh] overflow-y-auto hidden-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
