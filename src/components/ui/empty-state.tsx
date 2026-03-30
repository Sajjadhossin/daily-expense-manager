import Image from 'next/image';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon ? (
        <div className="w-20 h-20 mb-6 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center text-surface-400">
          {icon}
        </div>
      ) : (
        <div className="relative w-48 h-48 mb-6 drop-shadow-sm opacity-90">
          <Image
            src="/empty-illustration.png"
            alt="Empty state illustration"
            fill
            className="object-contain"
            priority
          />
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p className="text-sm max-w-[260px] mb-6" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
