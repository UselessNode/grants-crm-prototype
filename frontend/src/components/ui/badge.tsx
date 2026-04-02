import React, { useState } from 'react';
import { Icon } from '../common/icon';
import type { BadgeOption } from '../../types';

export type BadgeMode = 'default' | 'interactive' | 'expandable';

export interface BadgeBaseProps {
  mode?: BadgeMode;
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'document'
    | 'regulation'
    | 'form'
    | 'status-draft'
    | 'status-submitted'
    | 'status-review'
    | 'status-approved'
    | 'status-rejected';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export interface BadgeDefaultProps extends BadgeBaseProps {
  mode?: 'default';
  children: React.ReactNode;
}

export interface BadgeInteractiveProps extends BadgeBaseProps {
  mode: 'interactive';
  children: React.ReactNode;
  onEdit?: () => void;
  editTooltip?: string;
}

export interface BadgeExpandableProps extends BadgeBaseProps {
  mode: 'expandable';
  options: BadgeOption[];
  value?: string | number;
  onSelect: (option: BadgeOption) => void;
  colorizeOptions?: boolean;
}

export type BadgeProps =
  | BadgeDefaultProps
  | BadgeInteractiveProps
  | BadgeExpandableProps;

const variants = {
  default: 'bg-badge-default-bg text-badge-default-text',
  success: 'bg-badge-success-bg text-badge-success-text',
  warning: 'bg-badge-warning-bg text-badge-warning-text',
  error: 'bg-badge-error-bg text-badge-error-text',
  info: 'bg-badge-info-bg text-badge-info-text',
  document: 'bg-badge-document-bg text-badge-document-text',
  regulation: 'bg-badge-regulation-bg text-badge-regulation-text',
  form: 'bg-badge-form-bg text-badge-form-text',
  'status-draft': 'bg-status-draft-bg text-status-draft-text',
  'status-submitted': 'bg-status-submitted-bg text-status-submitted-text',
  'status-review': 'bg-status-review-bg text-status-review-text',
  'status-approved': 'bg-status-approved-bg text-status-approved-text',
  'status-rejected': 'bg-status-rejected-bg text-status-rejected-text',
};

const textSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const heightClasses = {
  sm: 'h-5',
  md: 'h-7',
  lg: 'h-9',
};

const paddingClasses = {
  sm: 'px-2',
  md: 'px-2.5',
  lg: 'px-3',
};

export const Badge: React.FC<BadgeProps> = (props) => {
  const {
    mode = 'default',
    variant = 'default',
    size = 'md',
    className = '',
    disabled = false,
  } = props;

  const baseStyles = 'inline-flex font-medium transition-colors';

  if (mode === 'expandable') {
    const { options, value, onSelect, colorizeOptions = false } = props as BadgeExpandableProps;
    const [isOpen, setIsOpen] = useState(false);

    const currentOption = options.find(o => o.id === value);

    return (
      <span className={`inline-flex relative ${className}`}>
        {/* Шапка: текущее значение */}
        <div
          className={`inline-flex items-center justify-between ${variants[variant]} ${textSizes[size]} ${paddingClasses[size]} py-1 transition-colors rounded-xl ${
            disabled ? 'opacity-60' : 'hover:brightness-95 cursor-pointer'
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className="font-medium whitespace-nowrap">{currentOption?.label || '—'}</span>
          <Icon name="chevron-down" size={12} className={`opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''} ml-2`} />
        </div>

        {/* Выпадающий список — поверх контента */}
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
              style={{ pointerEvents: 'auto' }}
            />
            <div className={`absolute top-full left-0 mt-1 ${variants[variant]} ${textSizes[size]} min-w-[160px] max-h-[200px] overflow-y-auto custom-scroll rounded-xl shadow-lg border border-gray-200 z-50`}>
              {options.map((option) => {
                const isSelected = option.id === value;
                const optionVariant = colorizeOptions && option.variant ? variants[option.variant] : variants[variant];

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      if (!disabled && onSelect) {
                        onSelect(option);
                        setIsOpen(false);
                      }
                    }}
                    className={`
                      w-full text-left px-3 py-1.5 flex items-center justify-between gap-2
                      transition-colors whitespace-nowrap
                      ${optionVariant}
                      ${isSelected ? 'bg-white/25 font-semibold' : 'hover:bg-white/15'}
                      ${disabled ? 'cursor-not-allowed opacity-60' : ''}
                    `}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Icon name="check" size={12} className="opacity-60 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </span>
    );
  }

  if (mode === 'interactive') {
    const { children, onEdit, editTooltip = 'Редактировать' } = props as BadgeInteractiveProps;

    return (
      <span className={`inline-flex items-start rounded-full ${className}`}>
        <span
          className={`${baseStyles} ${variants[variant]} ${heightClasses[size]} ${textSizes[size]} ${paddingClasses[size]} flex flex-col justify-center rounded-l-full`}
        >
          {children}
        </span>

        {onEdit && (
          <button
            className={`${baseStyles} ${variants[variant]} ${heightClasses[size]} ${textSizes[size]} px-2 transition-colors focus:outline-none flex items-center justify-center rounded-r-full ${
              disabled ? 'opacity-30 cursor-not-allowed' : 'opacity-80 hover:opacity-100 hover:brightness-95'
            }`}
            onClick={onEdit}
            title={editTooltip}
            disabled={disabled}
          >
            <Icon name="edit" size={10} />
          </button>
        )}
      </span>
    );
  }

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${heightClasses[size]} ${textSizes[size]} ${paddingClasses[size]} rounded-full flex items-center justify-center ${className}`}
    >
      {props.children}
    </span>
  );
};
