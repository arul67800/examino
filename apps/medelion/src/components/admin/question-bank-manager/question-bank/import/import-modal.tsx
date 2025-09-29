/**
 * Import Modal Component
 * Comprehensive import functionality for questions with validation and preview
 */

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ImportConfig, ImportResult, QuestionType, Difficulty } from '../types';

export interface ImportModalProps {
  onClose: () => void;
  onImport: (file: File, config: ImportConfig) => Promise<ImportResult>;
  className?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  onClose,
  onImport,
  className = ''
}) => {
  const [step, setStep] = useState<'upload' | 'configure' | 'preview' | 'importing' | 'results'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [config, setConfig] = useState<ImportConfig>({
    format: 'json',
    mapping: {},
    options: {
      skipDuplicates: true,
      updateExisting: false,
      validateBeforeImport: true,
      defaultDifficulty: Difficulty.MEDIUM,
      defaultPoints: 1,
      addTags: [],
    },
  });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File handling
  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      setConfig(prev => ({ ...prev, format: 'json' }));
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      setConfig(prev => ({ ...prev, format: 'csv' }));
    } else if (file.name.endsWith('.xlsx')) {
      setConfig(prev => ({ ...prev, format: 'xlsx' }));
    }

    // Generate preview
    try {
      const content = await readFileContent(file);
      const preview = await generatePreview(content, config.format);
      setPreviewData(preview);
      setStep('configure');
    } catch (error) {
      console.error('Failed to read file:', error);
      alert('Failed to read file. Please check the format and try again.');
    }
  }, [config.format]);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const generatePreview = async (content: string, format: string): Promise<any[]> => {
    switch (format) {
      case 'json':
        try {
          const data = JSON.parse(content);
          return Array.isArray(data) ? data.slice(0, 5) : [data];
        } catch {
          throw new Error('Invalid JSON format');
        }
      case 'csv':
        return parseCSVPreview(content);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  };

  const parseCSVPreview = (content: string): any[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) throw new Error('CSV must have at least header and one data row');
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const preview = [];
    
    for (let i = 1; i < Math.min(6, lines.length); i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      preview.push(row);
    }
    
    return preview;
  };

  // Import execution
  const handleImport = async () => {
    if (!selectedFile) return;

    setStep('importing');
    setIsProcessing(true);

    try {
      const result = await onImport(selectedFile, config);
      setImportResult(result);
      setStep('results');
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        imported: 0,
        skipped: 0,
        errors: [{
          row: 0,
          field: 'general',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          data: null,
        }],
        warnings: [],
      });
      setStep('results');
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and drop handling
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Render step components
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Questions</h3>
        <p className="text-gray-600">Upload a file to import questions into the question bank</p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">Drop files here or click to browse</p>
            <p className="text-gray-500">Supports JSON, CSV, and Excel files</p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.csv,.xlsx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
        }}
        className="hidden"
      />

      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Supported Formats</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>JSON:</strong> Structured question data with all fields</li>
          <li>• <strong>CSV:</strong> Tabular data with customizable field mapping</li>
          <li>• <strong>Excel:</strong> Spreadsheet format with multiple sheets support</li>
        </ul>
      </div>
    </div>
  );

  const renderConfigureStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Configure Import</h3>
          <p className="text-gray-600">Set up mapping and import options</p>
        </div>
        <button
          onClick={() => setStep('upload')}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Change File
        </button>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">{selectedFile?.name}</p>
            <p className="text-sm text-gray-500">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Import Options */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Import Options</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Difficulty
            </label>
            <select
              value={config.options.defaultDifficulty}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                options: { ...prev.options, defaultDifficulty: e.target.value as Difficulty }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={Difficulty.EASY}>Easy</option>
              <option value={Difficulty.MEDIUM}>Medium</option>
              <option value={Difficulty.HARD}>Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Default Points
            </label>
            <input
              type="number"
              min="1"
              value={config.options.defaultPoints}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                options: { ...prev.options, defaultPoints: parseInt(e.target.value) || 1 }
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.options.skipDuplicates}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                options: { ...prev.options, skipDuplicates: e.target.checked }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Skip duplicate questions</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.options.updateExisting}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                options: { ...prev.options, updateExisting: e.target.checked }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Update existing questions</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.options.validateBeforeImport}
              onChange={(e) => setConfig(prev => ({
                ...prev,
                options: { ...prev.options, validateBeforeImport: e.target.checked }
              }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Validate questions before import</span>
          </label>
        </div>
      </div>

      {/* Preview */}
      {previewData.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Preview ({previewData.length} samples)</h4>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              <pre className="text-xs p-4 text-gray-600">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderImportingStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-16 h-16 mx-auto">
        <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Importing Questions</h3>
        <p className="text-gray-600">Please wait while we process your file...</p>
      </div>
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="text-sm text-blue-800">
          <p>✓ Reading file format</p>
          <p>✓ Validating data structure</p>
          <p>• Processing questions...</p>
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto mb-4 ${importResult?.success ? 'text-green-500' : 'text-red-500'}`}>
          {importResult?.success ? (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${importResult?.success ? 'text-green-900' : 'text-red-900'}`}>
          {importResult?.success ? 'Import Completed Successfully' : 'Import Failed'}
        </h3>
      </div>

      {importResult && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Imported:</span>
                <span className="ml-2 text-green-600">{importResult.imported}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Skipped:</span>
                <span className="ml-2 text-yellow-600">{importResult.skipped}</span>
              </div>
            </div>
          </div>

          {/* Errors */}
          {importResult.errors.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-900">Errors ({importResult.errors.length})</h4>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-800">
                    {error.row > 0 && `Row ${error.row}: `}
                    {error.field && `${error.field} - `}
                    {error.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {importResult.warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-yellow-900">Warnings ({importResult.warnings.length})</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                {importResult.warnings.map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-800">
                    {warning.row > 0 && `Row ${warning.row}: `}
                    {warning.message}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Navigation buttons
  const renderNavigation = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        );
      case 'configure':
        return (
          <div className="flex justify-between">
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back
            </button>
            <div className="space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                Import Questions
              </button>
            </div>
          </div>
        );
      case 'importing':
        return null;
      case 'results':
        return (
          <div className="flex justify-end space-x-3">
            {importResult?.success && (
              <button
                onClick={() => {
                  setStep('upload');
                  setSelectedFile(null);
                  setPreviewData([]);
                  setImportResult(null);
                }}
                className="px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Import More
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Step Indicator */}
                <div className="flex items-center space-x-2">
                  {['upload', 'configure', 'importing', 'results'].map((stepName, index) => {
                    const isActive = step === stepName;
                    const isCompleted = ['upload', 'configure', 'importing'].indexOf(step) > index;
                    
                    return (
                      <React.Fragment key={stepName}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isActive 
                            ? 'bg-blue-600 text-white' 
                            : isCompleted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {isCompleted ? '✓' : index + 1}
                        </div>
                        {index < 3 && (
                          <div className={`w-8 h-0.5 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {step === 'upload' && renderUploadStep()}
            {step === 'configure' && renderConfigureStep()}
            {step === 'importing' && renderImportingStep()}
            {step === 'results' && renderResultsStep()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            {renderNavigation()}
          </div>
        </div>
      </div>
    </div>
  );
};