import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  to?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-pc-600 text-white hover:bg-pc-700 active:bg-pc-800 shadow-pc-sm',
  secondary: 'bg-titanium-900 text-white hover:bg-titanium-800 dark:bg-titanium-50 dark:text-titanium-900 dark:hover:bg-titanium-100',
  outline: 'border border-titanium-200 dark:border-titanium-600 text-titanium-700 dark:text-titanium-200 hover:bg-titanium-50 dark:hover:bg-midnight-700',
  ghost: 'text-titanium-700 dark:text-titanium-200 hover:bg-titanium-100 dark:hover:bg-midnight-700',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700 shadow-pc-sm',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  disabled,
  type = 'button',
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-pc font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-pc-500 focus:ring-offset-2 dark:focus:ring-offset-midnight-900';
  const classes = `${base} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
