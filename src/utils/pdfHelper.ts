import * as pdfjsLib from 'pdfjs-dist';
import { StructuredDocument, DocumentElement } from '../types';

// Ensure worker is configured safely
if (typeof window !== 'undefined' && pdfjsLib) {
  try {
    const version = pdfjsLib.version || '4.0.379';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.mjs`;
  } catch (e) {
    console.warn('PDF.js worker initialization warning:', e);
  }
}

export interface PdfInspectionResult {
  numPages: number;
  thumbnailDataUrl?: string;
  pagePreviews: string[];
  extractedText: string;
}

export async function inspectAndExtractPdf(arrayBuffer: ArrayBuffer): Promise<PdfInspectionResult> {
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pagePreviews: string[] = [];
  let fullText = '';

  // Render first few pages as preview thumbnails (up to 3 pages)
  const maxThumbnails = Math.min(numPages, 3);
  for (let i = 1; i <= maxThumbnails; i++) {
    try {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.75 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        // @ts-expect-error pdfjs typing
        await page.render({ canvasContext: context, viewport }).promise;
        pagePreviews.push(canvas.toDataURL('image/jpeg', 0.85));
      }
    } catch (err) {
      console.warn(`Failed to render thumbnail for page ${i}`, err);
    }
  }

  // Extract text across pages
  for (let i = 1; i <= numPages; i++) {
    try {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageLines: string[] = [];
      let currentLine = '';
      let lastY: number | null = null;

      for (const item of textContent.items) {
        if ('str' in item) {
          // Check if new line based on transform Y position
          const y = item.transform ? item.transform[5] : null;
          if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
            if (currentLine.trim()) {
              pageLines.push(currentLine.trim());
            }
            currentLine = item.str;
          } else {
            currentLine += (currentLine ? ' ' : '') + item.str;
          }
          lastY = y;
        }
      }
      if (currentLine.trim()) {
        pageLines.push(currentLine.trim());
      }
      fullText += `\n--- Page ${i} ---\n` + pageLines.join('\n') + '\n';
    } catch (err) {
      console.warn(`Failed to extract text from page ${i}`, err);
    }
  }

  return {
    numPages,
    thumbnailDataUrl: pagePreviews[0],
    pagePreviews,
    extractedText: fullText.trim(),
  };
}

/**
 * Fallback direct parser that creates a StructuredDocument from extracted PDF text
 * when Gemini API is offline or direct mode is selected.
 */
export function buildDocumentFromExtractedText(rawText: string, filename: string, numPages: number): StructuredDocument {
  const lines = rawText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const elements: DocumentElement[] = [];
  let docTitle = filename.replace(/\.pdf$/i, '');
  let docSubtitle: string | undefined;

  let isFirstHeadingFound = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('--- Page') && line.endsWith('---')) {
      if (elements.length > 0) {
        elements.push({ type: 'pageBreak' });
      }
      continue;
    }

    // Title heuristics
    if (!isFirstHeadingFound && i === 0 && line.length < 80) {
      docTitle = line;
      isFirstHeadingFound = true;
      continue;
    }

    if (i === 1 && line.length < 100 && !docSubtitle) {
      docSubtitle = line;
      continue;
    }

    // Headings detection
    const isNumberedHeading = /^\d+(\.\d+)*\s+[A-Z]/.test(line);
    const isAllCapsShort = line === line.toUpperCase() && line.length < 50 && line.length > 3 && /[A-Z]/.test(line);

    if (isNumberedHeading || isAllCapsShort) {
      elements.push({
        type: 'heading',
        level: isNumberedHeading && line.split('.').length > 2 ? 2 : 1,
        text: line,
      });
      continue;
    }

    // Bullet points
    if (/^[\u2022\u25E6\u2023\u2219\*\-]\s+/.test(line)) {
      const cleanText = line.replace(/^[\u2022\u25E6\u2023\u2219\*\-]\s+/, '');
      elements.push({
        type: 'list',
        ordered: false,
        items: [{ runs: [{ text: cleanText }] }],
      });
      continue;
    }

    // Numbered list
    if (/^\d+[\.\)]\s+/.test(line)) {
      const cleanText = line.replace(/^\d+[\.\)]\s+/, '');
      elements.push({
        type: 'list',
        ordered: true,
        items: [{ runs: [{ text: cleanText }] }],
      });
      continue;
    }

    // Table detection (lines containing multiple | or tab-separated chunks)
    if (line.includes('|') || line.split(/\s{3,}/).length >= 3) {
      const cells = line.includes('|')
        ? line.split('|').map((c) => c.trim()).filter(Boolean)
        : line.split(/\s{3,}/).map((c) => c.trim()).filter(Boolean);

      if (cells.length >= 2) {
        elements.push({
          type: 'table',
          rows: [
            {
              cells: cells.map((c) => ({ text: c })),
            },
          ],
        });
        continue;
      }
    }

    // Standard paragraph
    elements.push({
      type: 'paragraph',
      runs: [{ text: line }],
    });
  }

  return {
    title: docTitle,
    subtitle: docSubtitle,
    elements,
    metadata: {
      estimatedPages: numPages,
      wordCount: rawText.split(/\s+/).filter(Boolean).length,
      headingCount: elements.filter((e) => e.type === 'heading').length,
      tableCount: elements.filter((e) => e.type === 'table').length,
      sourceFilename: filename,
    },
  };
}
