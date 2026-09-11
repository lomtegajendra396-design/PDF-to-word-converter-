import React, { useState, useEffect, useCallback } from 'react';
import {
  StructuredDocument,
  ConversionOptions,
  ConvertedFileRecord,
} from './types';
import { Header } from './components/Header';
import { DropZone } from './components/DropZone';
import { ConversionSettings } from './components/ConversionSettings';
import { WordDocumentPreview } from './components/WordDocumentPreview';
import { DocumentQueue } from './components/DocumentQueue';
import { OriginalPdfViewer } from './components/OriginalPdfViewer';
import { SamplePickerModal } from './components/SamplePickerModal';
import { SAMPLE_DOCUMENTS } from './utils/sampleDocuments';
import { generateDocxBlob } from './utils/docxGenerator';
import { inspectAndExtractPdf, buildDocumentFromExtractedText, PdfInspectionResult } from './utils/pdfHelper';
import {
  FileText,
  Sparkles,
  ArrowLeft,
  Columns,
  Maximize2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Plus,
} from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState<ConvertedFileRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSamplePicker, setShowSamplePicker] = useState(false);
  const [viewMode, setViewMode] = useState<'split' | 'word-only'>('word-only');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [options, setOptions] = useState<ConversionOptions>({
    fontFamily: 'Calibri',
    fontSize: 'standard',
    lineSpacing: '1.15',
    margins: 'standard',
    includePageNumbers: true,
    tableStyle: 'striped',
    mode: 'ai_smart',
  });

  const activeDoc = documents.find((d) => d.id === activeId);

  // Helper to re-generate docx blob when options change
  const regenerateDocx = useCallback(
    async (docData: StructuredDocument, currentOptions: ConversionOptions): Promise<Blob> => {
      return await generateDocxBlob(docData, currentOptions);
    },
    []
  );

  // Handle options changes
  const handleOptionsChange = async (newOptions: ConversionOptions) => {
    setOptions(newOptions);
    if (activeDoc && activeDoc.documentData) {
      setIsRegenerating(true);
      try {
        const newBlob = await regenerateDocx(activeDoc.documentData, newOptions);
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === activeDoc.id
              ? {
                  ...doc,
                  docxBlob: newBlob,
                }
              : doc
          )
        );
      } catch (err) {
        console.error('Failed to regenerate docx with updated options', err);
      } finally {
        setIsRegenerating(false);
      }
    }
  };

  // Convert an uploaded PDF file
  const processPdfFile = async (file: File) => {
    const docId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Initial placeholder record
    const newRecord: ConvertedFileRecord = {
      id: docId,
      name: file.name,
      originalSize: file.size,
      pageCount: 1,
      convertedAt: new Date().toISOString(),
      status: 'uploading',
    };

    setDocuments((prev) => [newRecord, ...prev]);
    setActiveId(docId);

    try {
      // 1. Read array buffer for inspection & preview
      const arrayBuffer = await file.arrayBuffer();
      let inspection: PdfInspectionResult = { numPages: 1, pagePreviews: [], extractedText: '' };
      
      try {
        inspection = await inspectAndExtractPdf(arrayBuffer);
      } catch (inspectErr) {
        console.warn('PDF inspection warning:', inspectErr);
      }

      // Convert file to base64 for server upload
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const dataUrl = await base64Promise;
      const pdfBase64 = dataUrl.split(',')[1];

      // Update record with thumbnail and page count
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                pageCount: inspection.numPages,
                thumbnailUrl: inspection.thumbnailDataUrl,
                pdfDataUrl: dataUrl,
                status: 'converting',
              }
            : d
        )
      );

      // 2. Call server endpoint /api/convert
      let structuredDoc: StructuredDocument | null = null;
      let docxBlob: Blob | null = null;

      try {
        const res = await fetch('/api/convert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfBase64,
            filename: file.name,
            options,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.document) {
            structuredDoc = data.document;
            docxBlob = await generateDocxBlob(structuredDoc!, options);
          }
        } else {
          console.warn('Server conversion response not ok, attempting fallback...');
        }
      } catch (apiErr) {
        console.warn('Server conversion network error, attempting client fallback:', apiErr);
      }

      // 3. Fallback to client-side extraction if server didn't succeed
      if (!structuredDoc) {
        structuredDoc = buildDocumentFromExtractedText(
          inspection.extractedText || file.name,
          file.name,
          inspection.numPages
        );
        docxBlob = await generateDocxBlob(structuredDoc, options);
      }

      // Mark success
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                status: 'success',
                documentData: structuredDoc!,
                docxBlob: docxBlob!,
                convertedSize: docxBlob?.size,
              }
            : d
        )
      );
    } catch (err: unknown) {
      console.error('Fatal file processing error:', err);
      const message = err instanceof Error ? err.message : 'Conversion failed';
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === docId
            ? {
                ...d,
                status: 'error',
                errorMessage: message,
              }
            : d
        )
      );
    }
  };

  // Process files selected from DropZone
  const handleFilesSelected = (files: File[]) => {
    files.forEach((file) => processPdfFile(file));
  };

  // Load a built-in sample document
  const handleSelectSample = async (sampleId: string) => {
    const sample = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
    if (!sample) return;

    const docId = `sample-${sample.id}-${Date.now()}`;
    const blob = await generateDocxBlob(sample.data, options);

    const record: ConvertedFileRecord = {
      id: docId,
      name: sample.name,
      originalSize: 1024 * 142 * sample.pages,
      convertedSize: blob.size,
      pageCount: sample.pages,
      convertedAt: new Date().toISOString(),
      status: 'success',
      documentData: sample.data,
      docxBlob: blob,
    };

    setDocuments((prev) => [record, ...prev]);
    setActiveId(docId);
  };

  // Download converted docx
  const handleDownloadDocx = () => {
    if (!activeDoc || !activeDoc.docxBlob) return;
    const url = URL.createObjectURL(activeDoc.docxBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeDoc.name.replace(/\.pdf$/i, '') + '.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Remove document
  const handleRemoveDocument = (id: string) => {
    setDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      if (activeId === id) {
        setActiveId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-900 flex flex-col antialiased">
      <Header
        onOpenSamplePicker={() => setShowSamplePicker(true)}
        hasActiveDocument={Boolean(activeDoc)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* If no documents exist or converting the first one */}
        {documents.length === 0 ? (
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            {/* Value Proposition Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Convert PDF to Microsoft Word
              </h2>
              <p className="text-slate-600 mt-2.5 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                Extract tables, retain multi-column layouts, preserve typography, and download clean,
                fully editable <span className="font-semibold text-slate-800">.docx</span> documents.
              </p>
            </div>

            {/* Dropzone */}
            <DropZone
              onFilesSelected={handleFilesSelected}
              onSelectSample={handleSelectSample}
            />

            {/* Document Conversion Settings Pre-Configuration */}
            <div className="w-full mt-8">
              <ConversionSettings options={options} onChange={handleOptionsChange} />
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 w-full">
              <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-2.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">AI Layout Reconstruction</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Accurately preserves headings, bold/italic text runs, footnotes, and multi-level bulleted lists.
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-2.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">Table & Column Detection</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Financial tables, comparison matrices, and invoices convert into native Word table grids.
                </p>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-2.5">
                  <FileText className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1">True Native .docx Files</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generates genuine OpenXML Word files compatible with Microsoft Word, Google Docs, and LibreOffice.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Active Document Workspace */
          <div className="space-y-6">
            {/* Top Workspace Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 sm:p-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <button
                  id="convert-another-btn"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.pdf,application/pdf';
                    input.multiple = true;
                    input.onchange = (e) => {
                      const files = Array.from((e.target as HTMLInputElement).files || []);
                      if (files.length > 0) handleFilesSelected(files);
                    };
                    input.click();
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Convert Another PDF</span>
                </button>

                <span className="text-xs text-slate-400 hidden sm:inline">|</span>

                <span className="text-xs font-medium text-slate-600 hidden sm:inline">
                  Viewing:{' '}
                  <strong className="text-slate-900 font-bold">{activeDoc?.name}</strong>
                </span>
              </div>

              {/* View layout toggles */}
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs">
                  <button
                    onClick={() => setViewMode('word-only')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                      viewMode === 'word-only'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Word Document
                  </button>
                  <button
                    onClick={() => setViewMode('split')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                      viewMode === 'split'
                        ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Columns className="w-3 h-3" />
                    <span>Side-by-Side</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Queue & Settings Collapsible Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Queue & Document Options */}
              <div className="space-y-6">
                <DocumentQueue
                  documents={documents}
                  activeId={activeId}
                  onSelectDocument={(id) => setActiveId(id)}
                  onRemoveDocument={handleRemoveDocument}
                  onClearAll={() => setDocuments([])}
                />

                <ConversionSettings
                  options={options}
                  onChange={handleOptionsChange}
                  isConverting={activeDoc?.status === 'converting'}
                />

                {/* Original PDF Preview in side-by-side mode */}
                {viewMode === 'split' && activeDoc && (
                  <OriginalPdfViewer documentRecord={activeDoc} />
                )}
              </div>

              {/* Right/Main Column: Converted Word Document Preview */}
              <div className={viewMode === 'split' ? 'lg:col-span-2' : 'lg:col-span-2'}>
                {activeDoc?.status === 'converting' || activeDoc?.status === 'uploading' ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center min-h-[450px]">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                      <RefreshCw className="w-7 h-7 animate-spin" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Converting PDF to Word Document...
                    </h3>
                    <p className="text-xs text-slate-500 max-w-sm">
                      Extracting headings, table columns, reading order, and formatting styles.
                    </p>
                  </div>
                ) : activeDoc?.status === 'error' ? (
                  <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-xs">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">Conversion Notice</h3>
                    <p className="text-xs text-slate-600 max-w-md mx-auto mb-4">
                      {activeDoc.errorMessage || 'An error occurred during conversion.'}
                    </p>
                    <button
                      onClick={() => handleSelectSample('financial-report')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      Try a Sample Document
                    </button>
                  </div>
                ) : activeDoc?.documentData ? (
                  <WordDocumentPreview
                    documentData={activeDoc.documentData}
                    options={options}
                    filename={activeDoc.name}
                    docxBlob={activeDoc.docxBlob}
                    onDownload={handleDownloadDocx}
                    isRegenerating={isRegenerating}
                  />
                ) : null}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sample Picker Modal */}
      <SamplePickerModal
        isOpen={showSamplePicker}
        onClose={() => setShowSamplePicker(false)}
        onSelectSample={handleSelectSample}
      />
    </div>
  );
}
