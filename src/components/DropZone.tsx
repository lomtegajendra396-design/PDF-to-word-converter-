import React, { useState, useRef } from 'react';
import { UploadCloud, FileUp, Sparkles, FileText, ArrowRight } from 'lucide-react';
import { SAMPLE_DOCUMENTS } from '../utils/sampleDocuments';

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  onSelectSample: (sampleId: string) => void;
  isConverting?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFilesSelected,
  onSelectSample,
  isConverting = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const rawFiles: File[] = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    const files = rawFiles.filter(
      (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
    );

    if (files.length > 0) {
      onFilesSelected(files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const rawFiles: File[] = Array.from(e.target.files);
      const files = rawFiles.filter(
        (file) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      if (files.length > 0) {
        onFilesSelected(files);
      }
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        id="pdf-dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/60 scale-[1.008]'
            : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/70 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={isConverting}
        />

        <div className="max-w-xl mx-auto flex flex-col items-center">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-transform ${
              isDragOver ? 'bg-blue-600 text-white scale-110' : 'bg-blue-50 text-blue-600'
            }`}
          >
            <UploadCloud className="w-8 h-8 stroke-[1.75]" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 mb-2">
            Upload PDF to convert to Word
          </h3>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-md">
            Drag and drop your PDF file here, or{' '}
            <span className="text-blue-600 font-semibold underline underline-offset-2">
              browse from your computer
            </span>
            . Supports multi-column documents, tables, formatted text, and OCR.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full font-medium text-slate-700">
              <FileUp className="w-3.5 h-3.5 text-slate-500" />
              Standard .pdf format
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full font-medium text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Table & Heading Structure Preserved
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full font-medium text-slate-700">
              Up to 50 MB
            </span>
          </div>
        </div>
      </div>

      {/* Quick Sample Selector */}
      <div className="mt-6 pt-6 border-t border-slate-200/80">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            No PDF on hand? Test with an instant sample
          </span>
          <span className="text-xs text-slate-400">Click to convert instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_DOCUMENTS.map((sample) => (
            <button
              key={sample.id}
              id={`sample-btn-${sample.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelectSample(sample.id);
              }}
              className="group text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/40 transition-all shadow-2xs hover:shadow-xs cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                    {sample.category}
                  </span>
                  <span className="text-[11px] text-slate-400">{sample.pages} pgs</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                  {sample.name}
                </h4>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                  {sample.description}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-blue-600 group-hover:text-blue-700">
                <span>Convert to Word</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
