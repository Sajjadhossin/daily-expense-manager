import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullPage?: boolean;
}

export function ErrorState({
  title = "Something went wrong",
  message = "Please check your internet connection or try again later.",
  onRetry,
  fullPage = false,
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 ${
        fullPage ? "min-h-[60vh]" : "py-12"
      }`}
    >
      <div className="w-16 h-16 rounded-full bg-expense-100 dark:bg-expense-900/30 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-expense-600 dark:text-expense-400" />
      </div>
      <h3 className="text-lg font-bold mb-2 text-surface-900 dark:text-surface-50">
        {title}
      </h3>
      <p className="text-sm mb-6 max-w-[280px] text-surface-500 dark:text-surface-400">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}
