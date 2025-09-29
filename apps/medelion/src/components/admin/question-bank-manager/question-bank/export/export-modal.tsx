/**
 * Export Modal Component
 * Comprehensive export functionality with multiple formats and customization options
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Question, ExportConfig, QuestionFilters } from '../types';
import { useQuestionExport } from '../hooks';

export interface ExportModalProps {
  questions: Question[];
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
  className?: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  questions,
  onClose,
  onExport,
  className = ''
}) => {
  const { isExporting, exportProgress, exportQuestions } = useQuestionExport();
  
  const [config, setConfig] = useState<ExportConfig>({
    format: 'json',
    includeOptions: true,
    includeExplanations: true,
    includeReferences: true,
    includeMetadata: true,
  });

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>(questions);
  const [customFilters, setCustomFilters] = useState<QuestionFilters>({});
  const [step, setStep] = useState<'configure' | 'preview' | 'exporting'>('configure');

  const updateConfig = (key: keyof ExportConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleExport = useCallback(async () => {
    setStep('exporting');
    try {
      await exportQuestions({ ...config, filters: customFilters });
      onExport(config);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
      setStep('configure');
    }
  }, [config, customFilters, exportQuestions, onExport, onClose]);

  const getEstimatedSize = () => {
    let size = selectedQuestions.length * 500; // Base size per question
    if (config.includeOptions) size *= 1.5;
    if (config.includeExplanations) size *= 1.3;
    if (config.includeReferences) size *= 1.2;
    if (config.includeMetadata) size *= 1.1;
    
    if (size < 1024) return `${Math.round(size)} B`;
    if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Configuration</h3>
        <p className="text-gray-600">Configure your export settings and choose what to include</p>
      </div>

      {/* Export Format */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Export Format</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'json', label: 'JSON', desc: 'Structured data format' },
            { value: 'csv', label: 'CSV', desc: 'Spreadsheet compatible' },
            { value: 'xlsx', label: 'Excel', desc: 'Microsoft Excel format' },
            { value: 'pdf', label: 'PDF', desc: 'Printable document' },
          ].map((format) => (
            <button
              key={format.value}
              onClick={() => updateConfig('format', format.value)}
              className={`p-4 text-left border-2 rounded-lg transition-colors ${
                config.format === format.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="font-medium text-gray-900">{format.label}</div>
              <div className="text-sm text-gray-600">{format.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Include Options */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Include in Export</label>
        <div className="space-y-2">
          {[
            { key: 'includeOptions', label: 'Question Options', desc: 'All answer choices' },
            { key: 'includeExplanations', label: 'Explanations', desc: 'Detailed explanations' },
            { key: 'includeReferences', label: 'References', desc: 'Source references' },
            { key: 'includeMetadata', label: 'Metadata', desc: 'Created date, author, tags' },
          ].map((option) => (
            <label key={option.key} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                checked={config[option.key as keyof ExportConfig] as boolean}
                onChange={(e) => updateConfig(option.key as keyof ExportConfig, e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <div className="font-medium text-gray-900">{option.label}</div>
                <div className="text-sm text-gray-600">{option.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Question Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Questions to Export</label>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-blue-900">
                {selectedQuestions.length} questions selected
              </div>
              <div className="text-sm text-blue-700">
                Estimated size: {getEstimatedSize()}
              </div>
            </div>
            <div className="text-blue-600 text-2xl">📊</div>
          </div>
        </div>
      </div>

      {/* Advanced Options for specific formats */}
      {config.format === 'pdf' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">PDF Options</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Page Size</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="A4">A4</option>
                <option value="Letter">Letter</option>
                <option value="Legal">Legal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Layout</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="single">Single Column</option>
                <option value="double">Double Column</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {config.format === 'csv' && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">CSV Options</label>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Delimiter</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value=",">Comma (,)</option>
                <option value=";">Semicolon (;)</option>
                <option value="\t">Tab</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Encoding</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option value="utf8">UTF-8</option>
                <option value="latin1">Latin-1</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Preview</h3>
        <p className="text-gray-600">Review your export configuration before proceeding</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuration Summary */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Configuration</h4>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Format:</span>
              <span className="font-medium">{config.format.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Questions:</span>
              <span className="font-medium">{selectedQuestions.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Include Options:</span>
              <span className="font-medium">{config.includeOptions ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Include Explanations:</span>
              <span className="font-medium">{config.includeExplanations ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Size:</span>
              <span className="font-medium">{getEstimatedSize()}</span>
            </div>
          </div>
        </div>

        {/* Sample Output */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Sample Output</h4>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 text-sm font-mono max-h-64 overflow-y-auto">
            {config.format === 'json' && (
              <pre>{JSON.stringify({
                questions: [{
                  id: "sample-id",
                  humanId: "SAMPLE-001",
                  question: "Sample question text...",
                  type: "SINGLE_CHOICE",
                  difficulty: "MEDIUM",
                  points: 1,
                  ...(config.includeOptions && {
                    options: [
                      { text: "Option A", isCorrect: true },
                      { text: "Option B", isCorrect: false }
                    ]
                  }),
                  ...(config.includeExplanations && {
                    explanation: "Sample explanation..."
                  }),
                  ...(config.includeMetadata && {
                    createdAt: "2025-09-28T00:00:00Z",
                    tags: ["sample", "export"]
                  })
                }],
                exportInfo: {
                  exportedAt: new Date().toISOString(),
                  totalQuestions: selectedQuestions.length,
                  format: config.format
                }
              }, null, 2)}</pre>
            )}
            
            {config.format === 'csv' && (
              <pre>
                {`ID,Human ID,Question,Type,Difficulty,Points${config.includeOptions ? ',Options' : ''}${config.includeExplanations ? ',Explanation' : ''}
"sample-id","SAMPLE-001","Sample question...","SINGLE_CHOICE","MEDIUM",1${config.includeOptions ? ',"Option A (correct); Option B"' : ''}${config.includeExplanations ? ',"Sample explanation..."' : ''}`}
              </pre>
            )}
            
            {config.format === 'pdf' && (
              <div className="text-gray-300">
                <p>📄 PDF Document Preview</p>
                <p>━━━━━━━━━━━━━━━━━━━</p>
                <p>Question Bank Export</p>
                <p>Generated: {new Date().toLocaleDateString()}</p>
                <p></p>
                <p>1. Sample question text...</p>
                <p>   A) Option A ✓</p>
                <p>   B) Option B</p>
                {config.includeExplanations && <p>   Explanation: Sample...</p>}
                <p></p>
                <p>[{selectedQuestions.length} questions total]</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderExportingStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-16 h-16 mx-auto">
        <div className="relative">
          <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-blue-600">
            {Math.round(exportProgress)}%
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Export</h3>
        <p className="text-gray-600">Processing {selectedQuestions.length} questions...</p>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
        <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${exportProgress}%` }}
          ></div>
        </div>
        <div className="text-sm text-blue-800">
          {exportProgress < 30 && "Preparing data structure..."}
          {exportProgress >= 30 && exportProgress < 60 && "Processing questions..."}
          {exportProgress >= 60 && exportProgress < 90 && "Formatting output..."}
          {exportProgress >= 90 && "Finalizing export..."}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-2xl">📤</div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Export Questions</h2>
                  <p className="text-sm text-gray-600">
                    {step === 'configure' && 'Configure export settings'}
                    {step === 'preview' && 'Review export configuration'}
                    {step === 'exporting' && 'Generating export file'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                disabled={isExporting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 'configure' && renderConfigureStep()}
            {step === 'preview' && renderPreviewStep()}
            {step === 'exporting' && renderExportingStep()}
          </div>

          {/* Footer */}
          {!isExporting && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between">
                <div>
                  {step === 'preview' && (
                    <button
                      onClick={() => setStep('configure')}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Back to Configure
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  {step === 'configure' && (
                    <button
                      onClick={() => setStep('preview')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Preview Export
                    </button>
                  )}
                  
                  {step === 'preview' && (
                    <button
                      onClick={handleExport}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Generate & Download
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};