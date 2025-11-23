'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onGoogleSheetsUrl: (url: string) => void;
  isLoading: boolean;
}

export default function FileUpload({ onFileSelect, onGoogleSheetsUrl, isLoading }: FileUploadProps) {
  const [googleUrl, setGoogleUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: isLoading,
  });

  const handleGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (googleUrl.trim()) {
      onGoogleSheetsUrl(googleUrl.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Zone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
            : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-900'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
              {isDragActive ? 'Drop your file here!' : 'Drag & drop your spreadsheet'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              or click to browse
            </p>
          </div>
          <div className="flex justify-center gap-2 text-xs text-gray-400">
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">.xlsx</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">.xls</span>
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">.csv</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white dark:bg-gray-950 text-gray-500">or import from</span>
        </div>
      </div>

      {/* Google Sheets Option */}
      {!showUrlInput ? (
        <button
          onClick={() => setShowUrlInput(true)}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#0F9D58" d="M14.727 6.727H14V0H4.91c-.905 0-1.637.732-1.637 1.636v20.728c0 .904.732 1.636 1.636 1.636h14.182c.904 0 1.636-.732 1.636-1.636V6.727h-6z"/>
            <path fill="#F4B400" d="M14.727 0v6.727h6z"/>
            <path fill="#188038" d="M9.636 13.09H6.818v1.637h2.818v-1.636zm7.273 0h-5.454v1.637h5.454v-1.636zm-7.273 3.274H6.818v1.636h2.818v-1.636zm7.273 0h-5.454v1.636h5.454v-1.636z"/>
          </svg>
          <span className="font-medium">Google Sheets</span>
        </button>
      ) : (
        <form onSubmit={handleGoogleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="url"
              value={googleUrl}
              onChange={(e) => setGoogleUrl(e.target.value)}
              placeholder="Paste Google Sheets URL..."
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!googleUrl.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
