import React, { useState } from 'react';
import { ConvertedFileRecord } from '../types';
import { ChevronLeft, ChevronRight, Eye, FileText, ZoomIn, ZoomOut } from 'lucide-react';

interface OriginalPdfViewerProps {
  documentRecord: ConvertedFileRecord;
}

export const OriginalPdfViewer: React.FC<OriginalPdfViewerProps> = ({ documentRecord }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);

  // If we have rendered thumbnails/page previews
  const pagePreviews =
    documentRecord.pdfDataUrl && documentRecord.thumbnailUrl
      ? [documentRecord.thumbnailUrl]
      : [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">
            PDF
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
              Original PDF
            </h4>
            <span className="text-[11px] text-slate-500">
              {documentRecord.pageCount} page{documentRecord.pageCount > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
            className="p-1 rounded-md hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-medium text-slate-500 w-8 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel((z) => Math.min(1.5, z + 0.25))}
            className="p-1 rounded-md hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 bg-slate-100 rounded-lg p-3 overflow-auto flex items-center justify-center min-h-[350px]">
        {documentRecord.pdfDataUrl ? (
          <iframe
            src={documentRecord.pdfDataUrl}
            title="PDF Preview"
            className="w-full h-full min-h-[500px] rounded-md border border-slate-200 bg-white"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
          />
        ) : documentRecord.thumbnailUrl ? (
          <img
            src={documentRecord.thumbnailUrl}
            alt="PDF Page Preview"
            className="max-w-full h-auto rounded shadow-sm border border-slate-300"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          />
        ) : (
          <div className="text-center p-6">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-500">
              {documentRecord.name}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {(documentRecord.originalSize / 1024).toFixed(1)} KB • {documentRecord.pageCount} Pages
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
