'use client';

import { useState, useMemo } from 'react';
import FileUpload from '@/components/FileUpload';
import ColumnMapper from '@/components/ColumnMapper';
import ContactPreview from '@/components/ContactPreview';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { parseFile, parseCSV } from '@/lib/spreadsheet-parser';
import { mapAllRows } from '@/lib/contact-mapper';
import { SpreadsheetData, ColumnMapping, Contact, AppStep } from '@/lib/types';

export default function Home() {
  const [step, setStep] = useState<AppStep>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({
    name: null,
    phone: null,
    email: null,
    company: null,
    notes: null,
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [prefix, setPrefix] = useState('');

  // Apply prefix to contacts
  const prefixedContacts = useMemo(() => {
    if (!prefix.trim()) return contacts;
    return contacts.map(contact => ({
      ...contact,
      fullName: `${prefix.trim()} - ${contact.fullName}`,
    }));
  }, [contacts, prefix]);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await parseFile(file);
      setSpreadsheetData(data);
      setMapping(data.suggestedMapping);
      setStep('mapping');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSheetsUrl = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/google-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch Google Sheet');
      }

      const data = await parseCSV(result.csv);
      setSpreadsheetData(data);
      setMapping(data.suggestedMapping);
      setStep('mapping');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import Google Sheet');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreview = () => {
    if (!spreadsheetData) return;

    const mappedContacts = mapAllRows(spreadsheetData.rows, mapping);
    setContacts(mappedContacts);
    setStep('preview');
  };

  const handleExport = () => {
    setStep('export');
  };

  const handleStartOver = () => {
    setStep('upload');
    setSpreadsheetData(null);
    setMapping({
      name: null,
      phone: null,
      email: null,
      company: null,
      notes: null,
    });
    setContacts([]);
    setPrefix('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">📱</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800 dark:text-white">Sheet to Contacts</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Spreadsheet → Phone Contacts</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="hidden sm:flex items-center gap-2 text-sm">
            {(['upload', 'mapping', 'preview', 'export'] as AppStep[]).map((s, idx) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    step === s
                      ? 'bg-blue-600 text-white'
                      : ['mapping', 'preview', 'export'].indexOf(step) >= idx
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}
                >
                  {['mapping', 'preview', 'export'].indexOf(step) > idx ? '✓' : idx + 1}
                </div>
                {idx < 3 && (
                  <div className={`w-8 h-0.5 mx-1 ${
                    ['mapping', 'preview', 'export'].indexOf(step) >= idx
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
            <span className="text-red-500">⚠️</span>
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">Error</p>
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 dark:text-gray-300">Processing...</p>
            </div>
          </div>
        )}

        {/* Steps */}
        {step === 'upload' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
                Convert Spreadsheets to Contacts
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Upload your Excel, CSV, or Google Sheet and get a contact file ready for your phone in seconds.
              </p>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              onGoogleSheetsUrl={handleGoogleSheetsUrl}
              isLoading={isLoading}
            />

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
              <div className="text-center p-4">
                <div className="text-3xl mb-2">⚡</div>
                <p className="font-medium text-gray-700 dark:text-gray-200">Instant</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Convert in seconds</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">📱</div>
                <p className="font-medium text-gray-700 dark:text-gray-200">Universal</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Works on all phones</p>
              </div>
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🔒</div>
                <p className="font-medium text-gray-700 dark:text-gray-200">Private</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">No data stored</p>
              </div>
            </div>
          </div>
        )}

        {step === 'mapping' && spreadsheetData && (
          <ColumnMapper
            headers={spreadsheetData.headers}
            mapping={mapping}
            onMappingChange={setMapping}
            onNext={handlePreview}
            onBack={handleStartOver}
          />
        )}

        {step === 'preview' && (
          <ContactPreview
            contacts={contacts}
            prefix={prefix}
            onPrefixChange={setPrefix}
            onBack={() => setStep('mapping')}
            onExport={handleExport}
          />
        )}

        {step === 'export' && (
          <QRCodeDisplay
            contacts={prefixedContacts}
            prefix={prefix}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Built for real estate agents & salespeople who hate manual data entry</p>
        </div>
      </footer>
    </div>
  );
}
