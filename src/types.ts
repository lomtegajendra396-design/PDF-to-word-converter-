export interface TextRunItem {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
  color?: string;
  highlight?: string;
  isCode?: boolean;
  link?: string;
}

export interface ParagraphElement {
  type: 'paragraph';
  align?: 'left' | 'center' | 'right' | 'justify';
  runs: TextRunItem[];
}

export interface HeadingElement {
  type: 'heading';
  level: 1 | 2 | 3 | 4;
  text: string;
  align?: 'left' | 'center' | 'right';
}

export interface ListElement {
  type: 'list';
  ordered: boolean;
  items: {
    runs: TextRunItem[];
    level?: number;
  }[];
}

export interface TableCellItem {
  text: string;
  runs?: TextRunItem[];
  bold?: boolean;
  align?: 'left' | 'center' | 'right';
  colSpan?: number;
}

export interface TableRowItem {
  cells: TableCellItem[];
  isHeader?: boolean;
}

export interface TableElement {
  type: 'table';
  caption?: string;
  headers?: string[];
  rows: TableRowItem[];
}

export interface CalloutElement {
  type: 'callout';
  calloutType?: 'info' | 'warning' | 'note' | 'quote';
  title?: string;
  runs: TextRunItem[];
}

export interface PageBreakElement {
  type: 'pageBreak';
}

export type DocumentElement =
  | ParagraphElement
  | HeadingElement
  | ListElement
  | TableElement
  | CalloutElement
  | PageBreakElement;

export interface StructuredDocument {
  title: string;
  subtitle?: string;
  author?: string;
  elements: DocumentElement[];
  metadata?: {
    estimatedPages?: number;
    wordCount?: number;
    headingCount?: number;
    tableCount?: number;
    sourceFilename?: string;
  };
}

export interface ConversionOptions {
  fontFamily: 'Calibri' | 'Times New Roman' | 'Arial' | 'Georgia' | 'Aptos';
  fontSize: 'standard' | 'compact' | 'large';
  lineSpacing: '1.15' | 'single' | '1.5' | 'double';
  margins: 'standard' | 'narrow' | 'wide';
  includePageNumbers: boolean;
  tableStyle: 'grid' | 'striped' | 'clean' | 'minimal';
  mode: 'ai_smart' | 'direct';
}

export interface ConvertedFileRecord {
  id: string;
  name: string;
  originalSize: number;
  convertedSize?: number;
  pageCount: number;
  convertedAt: string;
  status: 'idle' | 'uploading' | 'converting' | 'success' | 'error';
  errorMessage?: string;
  documentData?: StructuredDocument;
  docxBlob?: Blob;
  docxBase64?: string;
  thumbnailUrl?: string;
  pdfDataUrl?: string;
}
