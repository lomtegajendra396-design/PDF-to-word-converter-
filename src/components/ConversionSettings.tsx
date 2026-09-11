import React from 'react';
import { ConversionOptions } from '../types';
import { Sliders, Type, AlignLeft, Table as TableIcon, Hash, Zap } from 'lucide-react';

interface ConversionSettingsProps {
  options: ConversionOptions;
  onChange: (options: ConversionOptions) => void;
  isConverting?: boolean;
}

export const ConversionSettings: React.FC<ConversionSettingsProps> = ({
  options,
  onChange,
  isConverting = false,
}) => {
  const updateOption = <K extends keyof ConversionOptions>(key: K, value: ConversionOptions[K]) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
        <Sliders className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Word Document Output Settings
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Font Family */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-slate-500" />
            <span>Word Typography</span>
          </label>
          <select
            id="setting-font-family"
            value={options.fontFamily}
            disabled={isConverting}
            onChange={(e) => updateOption('fontFamily', e.target.value as ConversionOptions['fontFamily'])}
            className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-colors"
          >
            <option value="Calibri">Calibri (Standard Office)</option>
            <option value="Aptos">Aptos (Modern Office 365)</option>
            <option value="Times New Roman">Times New Roman (Academic)</option>
            <option value="Arial">Arial (Clean Sans)</option>
            <option value="Georgia">Georgia (Editorial Serif)</option>
          </select>
        </div>

        {/* Spacing & Sizing */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <AlignLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Line Spacing & Margins</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <select
              id="setting-line-spacing"
              value={options.lineSpacing}
              disabled={isConverting}
              onChange={(e) => updateOption('lineSpacing', e.target.value as ConversionOptions['lineSpacing'])}
              className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs transition-colors"
            >
              <option value="1.15">1.15 Space</option>
              <option value="single">Single (1.0)</option>
              <option value="1.5">1.5 Space</option>
              <option value="double">Double (2.0)</option>
            </select>

            <select
              id="setting-margins"
              value={options.margins}
              disabled={isConverting}
              onChange={(e) => updateOption('margins', e.target.value as ConversionOptions['margins'])}
              className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-lg px-2 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs transition-colors"
            >
              <option value="standard">Standard (1")</option>
              <option value="narrow">Narrow (0.5")</option>
              <option value="wide">Wide (1.5")</option>
            </select>
          </div>
        </div>

        {/* Table Style */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <TableIcon className="w-3.5 h-3.5 text-slate-500" />
            <span>Table Theme</span>
          </label>
          <select
            id="setting-table-style"
            value={options.tableStyle}
            disabled={isConverting}
            onChange={(e) => updateOption('tableStyle', e.target.value as ConversionOptions['tableStyle'])}
            className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-colors"
          >
            <option value="striped">Zebra Striped Rows</option>
            <option value="grid">Full Border Grid</option>
            <option value="clean">Clean Minimalist Header</option>
          </select>
        </div>

        {/* Features & Options */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-slate-500" />
            <span>Layout Controls</span>
          </label>
          <div className="flex items-center gap-4 pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                id="setting-page-numbers"
                type="checkbox"
                checked={options.includePageNumbers}
                disabled={isConverting}
                onChange={(e) => updateOption('includePageNumbers', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-slate-700 font-medium flex items-center gap-1">
                <Hash className="w-3 h-3 text-slate-400" /> Page numbers
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
