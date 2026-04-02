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

  const handleClick = (sectionId: string) => {
    onSectionClick?.(sectionId);
  };

  return (
    <nav className="TableOfContents">
      <div className="TableOfContents__header">
        <span className="TableOfContents__title">Оглавление</span>
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
                  <span className="TableOfContents__error-badge" title={`${errorCount} ошибок`}>
                    !
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
