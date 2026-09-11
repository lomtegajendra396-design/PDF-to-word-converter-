import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { createDocxDocument } from './src/utils/docxGenerator';
import { Packer } from 'docx';
import { StructuredDocument, ConversionOptions } from './src/types';

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // AI-Powered PDF to Structured Word Document
  app.post('/api/convert', async (req, res) => {
    try {
      const { pdfBase64, filename, options } = req.body as {
        pdfBase64?: string;
        filename?: string;
        options?: ConversionOptions;
      };

      if (!pdfBase64) {
        return res.status(400).json({ error: 'Missing pdfBase64 parameter.' });
      }

      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const ai = getGeminiClient();

      if (!ai) {
        return res.status(503).json({
          error: 'GEMINI_API_KEY is not configured on the server. Falling back to direct client-side extraction.',
          fallback: true,
        });
      }

      const prompt = `You are a world-class document conversion and OCR engine specializing in converting PDF documents into structured Microsoft Word (.docx) documents.
Analyze this entire PDF document thoroughly.

Your objectives:
1. Reconstruct the document layout with maximal fidelity to the original.
2. Title & Subtitles: Identify document title, subtitle, dates, and author metadata.
3. Headings: Accurately categorize section headers into levels 1, 2, 3, or 4 based on hierarchy and visual prominence.
4. Text Formatting: Mark individual runs with 'bold', 'italic', 'underline', and semantic colors where appropriate.
5. Paragraphs: Preserve alignment (left, center, right, justify) and flow across multiple columns.
6. Bullet & Numbered Lists: Preserve list structures and nesting levels.
7. Tables: Convert all tabular grids into cleanly structured tables with column headers, cell alignments, and text content.
8. Callout & Highlight Boxes: Capture callout boxes, notes, or executive summaries.
9. Page breaks: Insert 'pageBreak' type elements where logical page boundaries occur.

Return valid JSON conforming to the requested schema.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Document main title' },
              subtitle: { type: Type.STRING, description: 'Subtitle or secondary header' },
              author: { type: Type.STRING, description: 'Author or entity name' },
              elements: {
                type: Type.ARRAY,
                description: 'Sequential elements of the document',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: {
                      type: Type.STRING,
                      description: 'Element type: paragraph, heading, list, table, callout, pageBreak',
                    },
                    level: { type: Type.INTEGER, description: 'Heading level 1, 2, 3, or 4' },
                    text: { type: Type.STRING, description: 'Plain text for heading' },
                    align: { type: Type.STRING, description: 'left, center, right, justify' },
                    runs: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          text: { type: Type.STRING },
                          bold: { type: Type.BOOLEAN },
                          italic: { type: Type.BOOLEAN },
                          underline: { type: Type.BOOLEAN },
                          color: { type: Type.STRING },
                        },
                        required: ['text'],
                      },
                    },
                    ordered: { type: Type.BOOLEAN },
                    items: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          runs: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                text: { type: Type.STRING },
                                bold: { type: Type.BOOLEAN },
                                italic: { type: Type.BOOLEAN },
                              },
                              required: ['text'],
                            },
                          },
                          level: { type: Type.INTEGER },
                        },
                        required: ['runs'],
                      },
                    },
                    headers: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    rows: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          isHeader: { type: Type.BOOLEAN },
                          cells: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                text: { type: Type.STRING },
                                bold: { type: Type.BOOLEAN },
                                align: { type: Type.STRING },
                              },
                              required: ['text'],
                            },
                          },
                        },
                        required: ['cells'],
                      },
                    },
                    calloutType: { type: Type.STRING },
                    title: { type: Type.STRING },
                  },
                  required: ['type'],
                },
              },
            },
            required: ['title', 'elements'],
          },
        },
      });

      const jsonText = response.text || '{}';
      const parsedStructure = JSON.parse(jsonText) as StructuredDocument;

      // Compute statistics
      const elements = parsedStructure.elements || [];
      let wordCount = (parsedStructure.title || '').split(/\s+/).filter(Boolean).length;
      let headingCount = 0;
      let tableCount = 0;

      for (const el of elements) {
        if (el.type === 'heading') {
          headingCount++;
          wordCount += (el.text || '').split(/\s+/).filter(Boolean).length;
        } else if (el.type === 'paragraph' || el.type === 'callout') {
          for (const run of el.runs || []) {
            wordCount += (run.text || '').split(/\s+/).filter(Boolean).length;
          }
        } else if (el.type === 'list') {
          for (const item of el.items || []) {
            for (const run of item.runs || []) {
              wordCount += (run.text || '').split(/\s+/).filter(Boolean).length;
            }
          }
        } else if (el.type === 'table') {
          tableCount++;
          for (const row of el.rows || []) {
            for (const cell of row.cells || []) {
              wordCount += (cell.text || '').split(/\s+/).filter(Boolean).length;
            }
          }
        }
      }

      parsedStructure.metadata = {
        wordCount,
        headingCount,
        tableCount,
        sourceFilename: filename || 'document.pdf',
        estimatedPages: Math.max(1, Math.ceil(wordCount / 350)),
      };

      const defaultOptions: ConversionOptions = options || {
        fontFamily: 'Calibri',
        fontSize: 'standard',
        lineSpacing: '1.15',
        margins: 'standard',
        includePageNumbers: true,
        tableStyle: 'striped',
        mode: 'ai_smart',
      };

      // Generate docx binary
      const docxDoc = createDocxDocument(parsedStructure, defaultOptions);
      const docxBase64 = await Packer.toBase64String(docxDoc);

      res.json({
        success: true,
        document: parsedStructure,
        docxBase64,
        stats: parsedStructure.metadata,
      });
    } catch (error: unknown) {
      console.error('Conversion error:', error);
      const message = error instanceof Error ? error.message : 'Internal conversion error';
      res.status(500).json({ error: message, fallback: true });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PDF to Word server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
