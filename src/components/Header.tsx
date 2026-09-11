import React from 'react';
import { FileText, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  onOpenSamplePicker: () => void;
  hasActiveDocument: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSamplePicker, hasActiveDocument }) => {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20">
            <FileText className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">PDF to Word</h1>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                <Sparkles className="w-3 h-3 text-blue-600" />
                AI DOCX Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Convert PDF files into formatted, editable Microsoft Word (.docx) documents
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="try-sample-btn"
            onClick={onOpenSamplePicker}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-slate-200/70 active:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>Try Sample PDF</span>
          </button>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Native DOCX Output</span>
          </div>
        </div>
      </div>
    </header>
  );
};
