import { type ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  default: 'bg-titanium-100 text-titanium-700 dark:bg-midnight-700 dark:text-titanium-200',
  success: 'bg-success-100 text-success-700 dark:bg-success-500/20 dark:text-success-500',
  warning: 'bg-warning-100 text-warning-600 dark:bg-warning-500/20 dark:text-warning-500',
  error: 'bg-danger-100 text-danger-600 dark:bg-danger-500/20 dark:text-danger-500',
  info: 'bg-pc-100 text-pc-700 dark:bg-pc-900/40 dark:text-pc-400',
  accent: 'bg-pc-600 text-white',
};

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`pc-badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
