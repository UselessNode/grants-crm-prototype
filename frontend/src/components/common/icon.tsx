import { SVGProps } from 'react';
import UserIcon from '../../assets/icons/user.svg?react';
import LoginIcon from '../../assets/icons/login.svg?react';
import RegisterIcon from '../../assets/icons/register.svg?react';
import ChatIcon from '../../assets/icons/chat.svg?react';
import DocumentIcon from '../../assets/icons/document.svg?react';
import PlusIcon from '../../assets/icons/plus.svg?react';
import TrashIcon from '../../assets/icons/trash.svg?react';
import EditIcon from '../../assets/icons/edit.svg?react';
import DeleteIcon from '../../assets/icons/delete.svg?react';
import LogoutIcon from '../../assets/icons/logout.svg?react';
import WarningIcon from '../../assets/icons/warning.svg?react';
import SuccessIcon from '../../assets/icons/success.svg?react';
import ErrorIcon from '../../assets/icons/error.svg?react';
import InfoIcon from '../../assets/icons/info.svg?react';
import ChevronDownIcon from '../../assets/icons/chevron-down.svg?react';
import ChevronLeftIcon from '../../assets/icons/chevron-left.svg?react';
import ArrowLeftIcon from '../../assets/icons/arrow-left.svg?react';
import ArrowRightIcon from '../../assets/icons/arrow-right.svg?react';
import CloseIcon from '../../assets/icons/close.svg?react';
import SearchIcon from '../../assets/icons/search.svg?react';
import FilterIcon from '../../assets/icons/filter.svg?react';
import SettingsIcon from '../../assets/icons/settings.svg?react';
import MenuIcon from '../../assets/icons/menu.svg?react';
import CheckIcon from '../../assets/icons/check.svg?react';
import LoadingIcon from '../../assets/icons/loading.svg?react';
import DownloadIcon from '../../assets/icons/download.svg?react';
import AddIcon from '../../assets/icons/add.svg?react';

/**
 * Типы поддерживаемых иконок
 */
export type IconName =
  | 'user'
  | 'login'
  | 'register'
  | 'chat'
  | 'document'
  | 'plus'
  | 'trash'
  | 'edit'
  | 'delete'
  | 'logout'
  | 'warning'
  | 'success'
  | 'error'
  | 'info'
  | 'chevron-down'
  | 'chevron-left'
  | 'arrow-left'
  | 'arrow-right'
  | 'close'
  | 'search'
  | 'filter'
  | 'settings'
  | 'menu'
  | 'check'
  | 'loading'
  | 'download'
  | 'add';

/**
 * Пропсы для компонента Icon
 */
export interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number | string;
  className?: string;
  title?: string;
}

/**
 * Мапа иконок
 */
const iconMap: Record<IconName, React.ComponentType<SVGProps<SVGSVGElement>>> = {
  'user': UserIcon,
  'login': LoginIcon,
  'register': RegisterIcon,
  'chat': ChatIcon,
  'document': DocumentIcon,
  'plus': PlusIcon,
  'trash': TrashIcon,
  'edit': EditIcon,
  'delete': DeleteIcon,
  'logout': LogoutIcon,
  'warning': WarningIcon,
  'success': SuccessIcon,
  'error': ErrorIcon,
  'info': InfoIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-left': ChevronLeftIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'close': CloseIcon,
  'search': SearchIcon,
  'filter': FilterIcon,
  'settings': SettingsIcon,
  'menu': MenuIcon,
  'check': CheckIcon,
  'loading': LoadingIcon,
  'download': DownloadIcon,
  'add': AddIcon,
};

/**
 * Централизованный компонент для отображения иконок
 * Использует SVG файлы из папки assets/icons
 */
export function Icon({
  name,
  size = 24,
  title,
  className = '',
  ...props
}: IconProps) {
  const sizeValue = typeof size === 'number' ? size : parseInt(size as string) || 24;
  const IconComponent = iconMap[name] || iconMap.info;

  return (
    <IconComponent
      width={sizeValue}
      height={sizeValue}
      className={`icon icon-${name} ${className}`}
      aria-label={title || name}
      {...props}
    />
  );
}

export default Icon;
