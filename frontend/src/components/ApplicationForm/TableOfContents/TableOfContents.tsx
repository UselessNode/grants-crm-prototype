import { useState } from 'react';
import Icon from '@frontend/components/common/icon';

import './TableOfContents.css';

export interface SectionError {
  sectionId: string;
  hasError: boolean;
  errorCount?: number;
}

interface TableOfContentsProps {
  sections: Array<{
    id: string;
    number: number;
    title: string;
  }>;
  errors: SectionError[];
  currentSection?: string;
  onSectionClick?: (sectionId: string) => void;
}

export function TableOfContents({
  sections,
  errors,
  currentSection,
  onSectionClick,
}: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getSectionStatus = (sectionId: string) => {
    const error = errors.find(e => e.sectionId === sectionId);
    if (error?.hasError) {
      return 'error';
    }
    return 'normal';
  };

  const getErrorCount = (sectionId: string) => {
    const error = errors.find(e => e.sectionId === sectionId);
    return error?.errorCount || 0;
  };

  const totalErrors = errors.reduce((sum, e) => sum + (e.errorCount || 0), 0);

  const handleClick = (sectionId: string) => {
    onSectionClick?.(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Кнопка-бургер для мобильных */}
      <button
        type="button"
        className="TableOfContents__toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Закрыть оглавление' : 'Открыть оглавление'}
      >
        <svg className="TableOfContents__toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
        <span className="TableOfContents__toggle-text">Оглавление</span>
        {totalErrors > 0 && (
          <span className="TableOfContents__toggle-badge">{totalErrors}</span>
        )}
      </button>

      {/* Overlay при открытом меню */}
      {isOpen && (
        <div
          className="TableOfContents__overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Сайдбар */}
      <nav className={`TableOfContents ${isOpen ? 'TableOfContents--open' : ''}`}>
        <div className="TableOfContents__header">
          <span className="TableOfContents__title">Оглавление</span>
          <button
            type="button"
            className="TableOfContents__close-btn"
            onClick={() => setIsOpen(false)}
            aria-label="Закрыть"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <ul className="TableOfContents__list">
          {sections.map(section => {
            const status = getSectionStatus(section.id);
            const errorCount = getErrorCount(section.id);
            const isActive = currentSection === section.id;

            return (
              <li
                key={section.id}
                className={`TableOfContents__item TableOfContents__item--${status} ${
                  isActive ? 'TableOfContents__item--active' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleClick(section.id)}
                  className="TableOfContents__link"
                >
                  <span className="TableOfContents__number">{section.number}.</span>
                  <span className="TableOfContents__title-text">{section.title}</span>
                  {status === 'error' && (

                    <Icon name="warning" size={16} className="text-red-500" title={`Ошибок: ${errorCount} `} />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
