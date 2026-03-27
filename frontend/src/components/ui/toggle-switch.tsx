import './ToggleSwitch.css';

export interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning';
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  icon,
  disabled = false,
  size = 'md',
  variant = 'default',
}: ToggleSwitchProps) {
  const sizeClasses = {
    sm: 'ToggleSwitch--sm',
    md: 'ToggleSwitch--md',
    lg: 'ToggleSwitch--lg',
  };

  const variantClasses = {
    default: 'ToggleSwitch--default',
    success: 'ToggleSwitch--success',
    warning: 'ToggleSwitch--warning',
  };

  return (
    <label className={`ToggleSwitch ${sizeClasses[size]} ${variantClasses[variant]} ${disabled ? 'ToggleSwitch--disabled' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="ToggleSwitch__input"
      />
      <span className="ToggleSwitch__track">
        <span className="ToggleSwitch__thumb">
          {icon && <span className="ToggleSwitch__icon">{icon}</span>}
        </span>
      </span>
      {label && <span className="ToggleSwitch__label">{label}</span>}
    </label>
  );
}
