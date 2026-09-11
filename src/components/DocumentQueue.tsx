import React from 'react';
import { ConvertedFileRecord } from '../types';
import { FileText, CheckCircle2, AlertCircle, Loader2, Trash2, ArrowRight } from 'lucide-react';

interface DocumentQueueProps {
  documents: ConvertedFileRecord[];
  activeId: string | null;
  onSelectDocument: (id: string) => void;
  onRemoveDocument: (id: string) => void;
  onClearAll: () => void;
}

export const DocumentQueue: React.FC<DocumentQueueProps> = ({
  documents,
  activeId,
  onSelectDocument,
  onRemoveDocument,
  onClearAll,
}) => {
  if (documents.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Document Queue ({documents.length})
          </span>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => {
          const isActive = doc.id === activeId;
          const isConverting = doc.status === 'converting' || doc.status === 'uploading';
          const isSuccess = doc.status === 'success';
          const isError = doc.status === 'error';

          return (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc.id)}
              className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                isActive
                  ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20 shadow-2xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Thumbnail or Icon */}
                {doc.thumbnailUrl ? (
                  <img
                    src={doc.thumbnailUrl}
                    alt={doc.name}
                    className="w-8 h-10 object-cover rounded-sm border border-slate-200 shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-8 h-10 rounded-sm bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0 font-bold text-[10px]">
                    PDF
                  </div>
                )}

                <div className="min-w-0">
                  <h4
                    className={`text-xs font-bold truncate ${
                      isActive ? 'text-blue-900' : 'text-slate-800'
                    }`}
                  >
                    {doc.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span>{(doc.originalSize / 1024).toFixed(1)} KB</span>
                    {doc.pageCount > 0 && (
                      <>
                        <span>•</span>
                        <span>{doc.pageCount} page{doc.pageCount > 1 ? 's' : ''}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Indicator & Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {isConverting && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium px-2 py-0.5 rounded-full bg-blue-50">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="hidden sm:inline">Converting...</span>
                  </div>
                )}

                {isSuccess && (
                  <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium px-2 py-0.5 rounded-full bg-emerald-50">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Converted</span>
                  </div>
                )}

                {isError && (
                  <div className="flex items-center gap-1 text-xs text-red-600 font-medium px-2 py-0.5 rounded-full bg-red-50">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Error</span>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveDocument(doc.id);
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
