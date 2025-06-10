import React, { useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  error?: string;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, error, isLoading }) => {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const jsonFile = files.find(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFile) {
      onFileUpload(jsonFile);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${isLoading 
            ? 'border-blue-300 bg-blue-50' 
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }
          ${error ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <div className="flex flex-col items-center space-y-4">
          {isLoading ? (
            <div className="animate-spin">
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
          ) : error ? (
            <AlertCircle className="w-12 h-12 text-red-500" />
          ) : (
            <Upload className="w-12 h-12 text-slate-400" />
          )}
          
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-700">
              {isLoading ? 'Processing...' : error ? 'Upload Error' : 'Upload SunSpec Model'}
            </h3>
            
            {error ? (
              <p className="text-sm text-red-600">{error}</p>
            ) : (
              <p className="text-sm text-slate-500">
                Drag and drop your JSON model file here, or click to browse
              </p>
            )}
          </div>

          {!isLoading && (
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <FileText className="w-4 h-4 mr-2" />
              Select File
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
};