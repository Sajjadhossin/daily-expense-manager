import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'muted' | 'white';
}

export function Loader({ size = 'md', variant = 'primary', className, ...props }: LoaderProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'text-primary-500',
    muted: 'text-surface-400 dark:text-surface-500',
    white: 'text-white',
  };

  return (
    <div className={cn('flex justify-center items-center', className)} {...props}>
      <Loader2 
        className={cn('animate-spin', sizeClasses[size], variantClasses[variant])} 
      />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex justify-center items-center min-h-[50vh] w-full">
      <Loader size="xl" />
    </div>
  );
}

export function OverlayLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[100] bg-white/60 dark:bg-black/60 backdrop-blur-sm flex flex-col justify-center items-center">
      <div className="bg-white dark:bg-surface-900 p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4">
        <Loader size="lg" />
        <p className="text-sm font-medium text-surface-600 dark:text-surface-300">
          {label}
        </p>
      </div>
    </div>
  );
}
