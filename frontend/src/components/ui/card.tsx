import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => {
  const baseStyles = 'bg-white rounded-lg shadow-sm border border-gray-200';

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'transition-shadow hover:shadow-lg cursor-pointer' : '';

  return (
    <div className={`${baseStyles} ${paddingStyles[padding]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

export interface CardHeaderProps {
  children?: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => {
  return (
    <div className={`flex items-center justify-between mb-4 pb-4 border-b border-gray-200 ${className}`}>
      <div>
        {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
