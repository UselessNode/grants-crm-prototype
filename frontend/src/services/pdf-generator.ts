import html2pdf from 'html2pdf.js';

export interface PdfOptions {
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  format?: string; // 'a4', 'letter' и т.д.
  margin?: number | [number, number, number, number]; // мм
  imageQuality?: number; // 0-1
  /** Если true – сразу сохранить файл, иначе вернуть Blob */
  download?: boolean;
  /** Дополнительные классы, которые будут применены к клонированному элементу (например, для печати) */
  cssClass?: string;
  /** Стили для @media print, которые будут вставлены в клон */
  printStyles?: string;
}

const defaultOptions: PdfOptions = {
  orientation: 'portrait',
  format: 'a4',
  margin: 10,
  imageQuality: 0.92,
  download: true,
  cssClass: 'pdf-export',
};

/**
 * Генерирует PDF из DOM-элемента.
 * @returns Promise<Blob> – PDF-файл в виде Blob.
 */
export async function generatePdfBlob(
  element: HTMLElement,
  options: PdfOptions = {}
): Promise<Blob> {
  const merged = { ...defaultOptions, ...options };
  const { orientation, format, margin, imageQuality, cssClass, printStyles } = merged;

  // Клонируем элемент, чтобы не повредить оригинал
  const clone = element.cloneNode(true) as HTMLElement;
  clone.classList.add(cssClass!);

  // Создаём временный контейнер
  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  // Вставляем стили для печати (можно передать свои)
  if (printStyles) {
    const styleEl = document.createElement('style');
    styleEl.textContent = printStyles;
    clone.prepend(styleEl);
  }

  const marginNumber = typeof margin === 'number' ? margin : 10;
  const pdfOptions = {
    margin: Array.isArray(margin) ? margin as [number, number, number, number] : [marginNumber, marginNumber, marginNumber, marginNumber] as [number, number, number, number],
    filename: '',
    image: { type: 'jpeg' as const, quality: imageQuality },
    html2canvas: {
      scale: 2,
      useCORS: true,
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format,
      orientation,
    },
  };

  try {
    const pdf = await html2pdf().set(pdfOptions).from(clone).toPdf().output('blob');
    return pdf as Blob;
  } finally {
    // Удаляем временный контейнер
    wrapper.remove();
  }
}

/**
 * Генерирует PDF и сразу сохраняет файл.
 */
export async function downloadPdf(
  element: HTMLElement,
  filename: string = 'document.pdf',
  options: PdfOptions = {}
): Promise<void> {
  const blob = await generatePdfBlob(element, options);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
