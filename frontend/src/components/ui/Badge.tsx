import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'status-draft' | 'status-submitted' | 'status-review' | 'status-approved' | 'status-rejected';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full';

  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    'status-draft': 'bg-status-draft-bg text-status-draft-text',
    'status-submitted': 'bg-status-submitted-bg text-status-submitted-text',
    'status-review': 'bg-status-review-bg text-status-review-text',
    'status-approved': 'bg-status-approved-bg text-status-approved-text',
    'status-rejected': 'bg-status-rejected-bg text-status-rejected-text',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};
