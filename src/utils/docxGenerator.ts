import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType,
  UnderlineType,
  Footer,
  PageNumber,
  Packer,
} from 'docx';
import { StructuredDocument, ConversionOptions, TextRunItem, DocumentElement } from '../types';

export function createDocxDocument(docData: StructuredDocument, options: ConversionOptions): Document {
  const font = options.fontFamily || 'Calibri';
  
  // Base font size in half-points (22 = 11pt, 24 = 12pt, 20 = 10pt)
  const baseSize = options.fontSize === 'large' ? 24 : options.fontSize === 'compact' ? 20 : 22;
  
  const lineSpacing = options.lineSpacing === 'single' ? 240 : options.lineSpacing === '1.5' ? 360 : options.lineSpacing === 'double' ? 480 : 276; // 276 is ~1.15
  
  // Margins in dxa (1 inch = 1440 dxa)
  let marginDxa = 1440;
  if (options.margins === 'narrow') marginDxa = 720;
  if (options.margins === 'wide') marginDxa = 2160;

  const children: (Paragraph | Table)[] = [];

  // Title if present
  if (docData.title) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 120 },
        children: [
          new TextRun({
            text: docData.title,
            bold: true,
            size: baseSize + 16,
            font,
            color: '1E293B',
          }),
        ],
      })
    );
  }

  // Subtitle if present
  if (docData.subtitle) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 280 },
        children: [
          new TextRun({
            text: docData.subtitle,
            italics: true,
            size: baseSize + 4,
            font,
            color: '64748B',
          }),
        ],
      })
    );
  }

  const helperTextRuns = (runs: TextRunItem[], inheritBold?: boolean): TextRun[] => {
    return runs.map((run) => {
      return new TextRun({
        text: run.text,
        bold: inheritBold || run.bold,
        italics: run.italic,
        underline: run.underline ? { type: UnderlineType.SINGLE } : undefined,
        strike: run.strike,
        font,
        size: baseSize,
        color: run.color || '1E293B',
      });
    });
  };

  const getAlignment = (align?: 'left' | 'center' | 'right' | 'justify') => {
    switch (align) {
      case 'center':
        return AlignmentType.CENTER;
      case 'right':
        return AlignmentType.RIGHT;
      case 'justify':
        return AlignmentType.JUSTIFIED;
      default:
        return AlignmentType.LEFT;
    }
  };

  // Convert elements
  for (const element of docData.elements) {
    if (element.type === 'pageBreak') {
      children.push(
        new Paragraph({
          pageBreakBefore: true,
          children: [],
        })
      );
      continue;
    }

    if (element.type === 'heading') {
      let hl: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1;
      let size = baseSize + 10;
      let before = 280;
      let after = 120;
      let color = '0F172A';

      if (element.level === 2) {
        hl = HeadingLevel.HEADING_2;
        size = baseSize + 6;
        before = 240;
        after = 100;
        color = '1E293B';
      } else if (element.level === 3) {
        hl = HeadingLevel.HEADING_3;
        size = baseSize + 2;
        before = 180;
        after = 80;
        color = '334155';
      } else if (element.level >= 4) {
        hl = HeadingLevel.HEADING_4;
        size = baseSize;
        before = 140;
        after = 60;
        color = '475569';
      }

      children.push(
        new Paragraph({
          heading: hl,
          alignment: getAlignment(element.align),
          spacing: { before, after },
          children: [
            new TextRun({
              text: element.text,
              bold: true,
              size,
              font,
              color,
            }),
          ],
        })
      );
      continue;
    }

    if (element.type === 'paragraph') {
      children.push(
        new Paragraph({
          alignment: getAlignment(element.align),
          spacing: { before: 60, after: 120, line: lineSpacing },
          children: helperTextRuns(element.runs),
        })
      );
      continue;
    }

    if (element.type === 'list') {
      element.items.forEach((item, idx) => {
        const bulletPrefix = element.ordered ? `${idx + 1}. ` : '• ';
        children.push(
          new Paragraph({
            spacing: { before: 40, after: 60, line: lineSpacing },
            indent: { left: 400 * ((item.level || 0) + 1) },
            children: [
              new TextRun({
                text: bulletPrefix,
                bold: true,
                font,
                size: baseSize,
                color: '475569',
              }),
              ...helperTextRuns(item.runs),
            ],
          })
        );
      });
      continue;
    }

    if (element.type === 'callout') {
      children.push(
        new Paragraph({
          spacing: { before: 180, after: 180, line: lineSpacing },
          indent: { left: 400, right: 200 },
          border: {
            left: {
              style: BorderStyle.SINGLE,
              size: 24,
              color: element.calloutType === 'warning' ? 'F59E0B' : '3B82F6',
            },
          },
          shading: {
            type: ShadingType.CLEAR,
            fill: element.calloutType === 'warning' ? 'FEF3C7' : 'EFF6FF',
          },
          children: [
            ...(element.title
              ? [
                  new TextRun({
                    text: `${element.title}\n`,
                    bold: true,
                    font,
                    size: baseSize + 1,
                    color: element.calloutType === 'warning' ? '92400E' : '1E40AF',
                  }),
                ]
              : []),
            ...helperTextRuns(element.runs),
          ],
        })
      );
      continue;
    }

    if (element.type === 'table') {
      const tableRows: TableRow[] = [];

      element.rows.forEach((row, rowIdx) => {
        const isHeader = row.isHeader || (rowIdx === 0 && element.headers !== undefined);
        const cellItems: TableCell[] = [];

        row.cells.forEach((cell) => {
          const runs = cell.runs && cell.runs.length > 0 ? cell.runs : [{ text: cell.text, bold: isHeader || cell.bold }];
          
          cellItems.push(
            new TableCell({
              shading: isHeader
                ? { type: ShadingType.CLEAR, fill: 'F1F5F9' }
                : options.tableStyle === 'striped' && rowIdx % 2 === 1
                ? { type: ShadingType.CLEAR, fill: 'F8FAFC' }
                : undefined,
              margins: {
                top: 120,
                bottom: 120,
                left: 160,
                right: 160,
              },
              children: [
                new Paragraph({
                  alignment: getAlignment(cell.align),
                  children: helperTextRuns(runs, isHeader || cell.bold),
                }),
              ],
            })
          );
        });

        tableRows.push(
          new TableRow({
            tableHeader: isHeader,
            children: cellItems,
          })
        );
      });

      if (tableRows.length > 0) {
        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          })
        );
        // spacing after table
        children.push(new Paragraph({ spacing: { before: 120, after: 120 }, children: [] }));
      }
      continue;
    }
  }

  // Configure footers with page numbering if requested
  const footers = options.includePageNumbers
    ? {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: 'Page ', font, size: 18, color: '64748B' }),
                new TextRun({ children: [PageNumber.CURRENT], font, size: 18, color: '64748B' }),
                new TextRun({ text: ' of ', font, size: 18, color: '64748B' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font, size: 18, color: '64748B' }),
              ],
            }),
          ],
        }),
      }
    : undefined;

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: marginDxa,
              right: marginDxa,
              bottom: marginDxa,
              left: marginDxa,
            },
          },
        },
        footers,
        children,
      },
    ],
  });
}

export async function generateDocxBlob(docData: StructuredDocument, options: ConversionOptions): Promise<Blob> {
  const doc = createDocxDocument(docData, options);
  return await Packer.toBlob(doc);
}
