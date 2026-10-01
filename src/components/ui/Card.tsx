import { type ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = '', hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${hover ? 'transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
