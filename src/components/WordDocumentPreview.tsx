import React, { useState } from 'react';
import { StructuredDocument, ConversionOptions, DocumentElement } from '../types';
import {
  Download,
  Copy,
  Check,
  Edit3,
  Eye,
  FileSpreadsheet,
  Type,
  ListOrdered,
  FileCheck,
  RefreshCw,
  Hash,
} from 'lucide-react';

interface WordDocumentPreviewProps {
  documentData: StructuredDocument;
  options: ConversionOptions;
  filename: string;
  docxBlob?: Blob;
  onDownload: () => void;
  onUpdateDocument?: (updated: StructuredDocument) => void;
  isRegenerating?: boolean;
}

export const WordDocumentPreview: React.FC<WordDocumentPreviewProps> = ({
  documentData,
  options,
  filename,
  docxBlob,
  onDownload,
  onUpdateDocument,
  isRegenerating = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedType, setCopiedType] = useState<'none' | 'text' | 'markdown'>('none');
  const [activeHeadingFilter, setActiveHeadingFilter] = useState<string | null>(null);

  // Derive typography styles based on selected options
  const getFontFamilyStyle = () => {
    switch (options.fontFamily) {
      case 'Times New Roman':
        return 'font-serif';
      case 'Georgia':
        return 'font-serif';
      case 'Arial':
        return 'font-sans';
      case 'Aptos':
      case 'Calibri':
      default:
        return 'font-sans';
    }
  };

  const getMarginClass = () => {
    switch (options.margins) {
      case 'narrow':
        return 'p-6 sm:p-8';
      case 'wide':
        return 'p-10 sm:p-16';
      case 'standard':
      default:
        return 'p-8 sm:p-12';
    }
  };

  const getLineHeightClass = () => {
    switch (options.lineSpacing) {
      case 'single':
        return 'leading-normal';
      case '1.5':
        return 'leading-relaxed';
      case 'double':
        return 'leading-loose';
      case '1.15':
      default:
        return 'leading-normal';
    }
  };

  // Copy helpers
  const handleCopyPlainText = () => {
    let fullText = `${documentData.title}\n`;
    if (documentData.subtitle) fullText += `${documentData.subtitle}\n\n`;

    for (const el of documentData.elements) {
      if (el.type === 'heading') {
        fullText += `\n${el.text}\n`;
      } else if (el.type === 'paragraph' || el.type === 'callout') {
        fullText += `${el.runs.map((r) => r.text).join('')}\n\n`;
      } else if (el.type === 'list') {
        el.items.forEach((item, idx) => {
          fullText += `${el.ordered ? `${idx + 1}.` : '•'} ${item.runs.map((r) => r.text).join('')}\n`;
        });
        fullText += '\n';
      } else if (el.type === 'table') {
        el.rows.forEach((row) => {
          fullText += row.cells.map((c) => c.text).join('\t') + '\n';
        });
        fullText += '\n';
      }
    }

    navigator.clipboard.writeText(fullText.trim());
    setCopiedType('text');
    setTimeout(() => setCopiedType('none'), 2000);
  };

  const headings = documentData.elements
    .filter((el): el is Extract<DocumentElement, { type: 'heading' }> => el.type === 'heading')
    .map((h) => h.text);

  return (
    <div className="flex flex-col gap-5">
      {/* Top Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            W
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                {filename.replace(/\.pdf$/i, '.docx')}
              </h4>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                Word (.docx)
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
              <span>{documentData.metadata?.wordCount || 0} words</span>
              <span>•</span>
              <span>{documentData.metadata?.headingCount || 0} headings</span>
              <span>•</span>
              <span>{documentData.metadata?.tableCount || 0} tables</span>
              {docxBlob && (
                <>
                  <span>•</span>
                  <span>{(docxBlob.size / 1024).toFixed(1)} KB</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            id="toggle-edit-mode-btn"
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              isEditing
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            <span>{isEditing ? 'Viewing Mode' : 'Edit Text'}</span>
          </button>

          <button
            id="copy-text-btn"
            onClick={handleCopyPlainText}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
          >
            {copiedType === 'text' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <button
            id="download-docx-btn"
            onClick={onDownload}
            disabled={isRegenerating}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isRegenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Download .docx</span>
          </button>
        </div>
      </div>

      {/* Headings Navigator (Table of Contents shortcuts) */}
      {headings.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap pl-1 pr-2">Jump to:</span>
          {headings.map((headingText, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveHeadingFilter(headingText);
                const el = document.getElementById(`heading-section-${idx}`);
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap font-medium transition-colors cursor-pointer"
            >
              {headingText}
            </button>
          ))}
        </div>
      )}

      {/* Word Paper Document Simulator */}
      <div className="bg-slate-200/70 p-4 sm:p-8 rounded-2xl border border-slate-300/80 shadow-inner flex justify-center overflow-x-auto">
        <div
          id="simulated-word-page"
          contentEditable={isEditing}
          suppressContentEditableWarning={true}
          style={{ fontFamily: options.fontFamily }}
          className={`w-full max-w-[850px] bg-white text-slate-900 shadow-md border border-slate-300 rounded-xs min-h-[900px] transition-all ${getMarginClass()} ${getLineHeightClass()} ${getFontFamilyStyle()} ${
            isEditing ? 'ring-2 ring-amber-400/80 outline-none cursor-text' : ''
          }`}
        >
          {/* Document Header Metadata */}
          {documentData.title && (
            <div className="text-center mb-6 pb-2 border-b border-slate-200">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
                {documentData.title}
              </h1>
              {documentData.subtitle && (
                <p className="text-sm text-slate-600 italic max-w-xl mx-auto">
                  {documentData.subtitle}
                </p>
              )}
            </div>
          )}

          {/* Sequential Elements */}
          <div className="space-y-4">
            {documentData.elements.map((element, idx) => {
              if (element.type === 'pageBreak') {
                return (
                  <div
                    key={idx}
                    className="relative my-8 border-t-2 border-dashed border-slate-300 text-center select-none"
                  >
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      --- Page Break ---
                    </span>
                  </div>
                );
              }

              if (element.type === 'heading') {
                const headingClasses =
                  element.level === 1
                    ? 'text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-2 border-b border-slate-200 pb-1'
                    : element.level === 2
                    ? 'text-lg sm:text-xl font-bold text-slate-800 mt-5 mb-2'
                    : element.level === 3
                    ? 'text-base sm:text-lg font-semibold text-slate-800 mt-4 mb-1'
                    : 'text-sm sm:text-base font-semibold text-slate-700 mt-3 mb-1';

                return (
                  <div
                    key={idx}
                    id={`heading-section-${idx}`}
                    className={`${headingClasses} ${
                      element.align === 'center'
                        ? 'text-center'
                        : element.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    {element.text}
                  </div>
                );
              }

              if (element.type === 'paragraph') {
                const alignClass =
                  element.align === 'center'
                    ? 'text-center'
                    : element.align === 'right'
                    ? 'text-right'
                    : element.align === 'justify'
                    ? 'text-justify'
                    : 'text-left';

                return (
                  <p key={idx} className={`text-slate-800 text-sm sm:text-[15px] ${alignClass}`}>
                    {element.runs.map((run, rIdx) => (
                      <span
                        key={rIdx}
                        className={`${run.bold ? 'font-bold' : ''} ${run.italic ? 'italic' : ''} ${
                          run.underline ? 'underline underline-offset-2' : ''
                        } ${run.strike ? 'line-through' : ''}`}
                        style={{ color: run.color }}
                      >
                        {run.text}
                      </span>
                    ))}
                  </p>
                );
              }

              if (element.type === 'list') {
                return (
                  <div key={idx} className="my-2 space-y-1.5 pl-4 sm:pl-6 text-sm sm:text-[15px]">
                    {element.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-start gap-2.5"
                        style={{ marginLeft: `${(item.level || 0) * 1.25}rem` }}
                      >
                        <span className="font-semibold text-slate-600 select-none min-w-[1.25rem]">
                          {element.ordered ? `${itemIdx + 1}.` : '•'}
                        </span>
                        <div className="text-slate-800 flex-1">
                          {item.runs.map((run, rIdx) => (
                            <span
                              key={rIdx}
                              className={`${run.bold ? 'font-bold' : ''} ${
                                run.italic ? 'italic' : ''
                              }`}
                            >
                              {run.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              }

              if (element.type === 'callout') {
                const isWarning = element.calloutType === 'warning';
                return (
                  <div
                    key={idx}
                    className={`my-4 p-4 rounded-lg border-l-4 ${
                      isWarning
                        ? 'border-amber-500 bg-amber-50/80 text-amber-950'
                        : 'border-blue-500 bg-blue-50/80 text-blue-950'
                    }`}
                  >
                    {element.title && (
                      <div className="font-bold text-sm mb-1">{element.title}</div>
                    )}
                    <div className="text-sm">
                      {element.runs.map((run, rIdx) => (
                        <span
                          key={rIdx}
                          className={`${run.bold ? 'font-bold' : ''} ${run.italic ? 'italic' : ''}`}
                        >
                          {run.text}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              }

              if (element.type === 'table') {
                return (
                  <div key={idx} className="my-5 overflow-x-auto">
                    {element.caption && (
                      <p className="text-xs font-semibold text-slate-500 mb-1.5 italic">
                        {element.caption}
                      </p>
                    )}
                    <table className="w-full border-collapse text-xs sm:text-sm border border-slate-300">
                      <tbody>
                        {element.rows.map((row, rIdx) => {
                          const isHeaderRow =
                            row.isHeader || (rIdx === 0 && element.headers !== undefined);
                          return (
                            <tr
                              key={rIdx}
                              className={
                                isHeaderRow
                                  ? 'bg-slate-100 font-semibold border-b border-slate-300'
                                  : options.tableStyle === 'striped' && rIdx % 2 === 1
                                  ? 'bg-slate-50/70 border-b border-slate-200'
                                  : 'border-b border-slate-200'
                              }
                            >
                              {row.cells.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  colSpan={cell.colSpan}
                                  className={`p-2.5 sm:p-3 border-r border-slate-200 last:border-r-0 ${
                                    cell.align === 'right'
                                      ? 'text-right'
                                      : cell.align === 'center'
                                      ? 'text-center'
                                      : 'text-left'
                                  } ${cell.bold || isHeaderRow ? 'font-semibold text-slate-900' : 'text-slate-800'}`}
                                >
                                  {cell.text}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              }

              return null;
            })}
          </div>

          {/* Footer simulation */}
          {options.includePageNumbers && (
            <div className="mt-16 pt-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 select-none">
              <span>{documentData.title || filename}</span>
              <span>Page 1 of {documentData.metadata?.estimatedPages || 1}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
