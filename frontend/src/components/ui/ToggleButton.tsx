import './ToggleButton.css';

export interface ToggleButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'success' | 'warning';
}

export function ToggleButton({
  active,
  onClick,
  label,
  icon,
  disabled = false,
  variant = 'default',
}: ToggleButtonProps) {
  const variantClasses = {
    default: 'ToggleButton--default',
    success: 'ToggleButton--success',
    warning: 'ToggleButton--warning',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`ToggleButton ${variantClasses[variant]} ${active ? 'ToggleButton--active' : ''} ${disabled ? 'ToggleButton--disabled' : ''}`}
    >
      {icon && <span className="ToggleButton__icon">{icon}</span>}
      <span className="ToggleButton__label">{label}</span>
    </button>
  );
}
