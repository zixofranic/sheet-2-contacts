'use client';

import { ColumnMapping } from '@/lib/types';

interface ColumnMapperProps {
  headers: string[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
  onNext: () => void;
  onBack: () => void;
}

const FIELD_CONFIG = [
  { key: 'name', label: 'Name', icon: '👤', required: true },
  { key: 'phone', label: 'Phone', icon: '📱', required: true },
  { key: 'email', label: 'Email', icon: '📧', required: false },
  { key: 'company', label: 'Company', icon: '🏢', required: false },
  { key: 'notes', label: 'Notes', icon: '📝', required: false },
] as const;

export default function ColumnMapper({ headers, mapping, onMappingChange, onNext, onBack }: ColumnMapperProps) {
  const handleChange = (field: keyof ColumnMapping, value: string) => {
    const newMapping = { ...mapping };
    newMapping[field] = value === '' ? null : parseInt(value, 10);
    onMappingChange(newMapping);
  };

  const isValid = mapping.name !== null || mapping.phone !== null;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Map Your Columns</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Match your spreadsheet columns to contact fields
        </p>
      </div>

      <div className="space-y-4">
        {FIELD_CONFIG.map(({ key, label, icon, required }) => (
          <div key={key} className="flex items-center gap-4">
            <div className="w-32 flex items-center gap-2">
              <span className="text-xl">{icon}</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {label}
                {required && <span className="text-red-500">*</span>}
              </span>
            </div>
            <select
              value={mapping[key] ?? ''}
              onChange={(e) => handleChange(key, e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select column --</option>
              {headers.map((header, idx) => (
                <option key={idx} value={idx}>
                  {header || `Column ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {!isValid && (
        <p className="text-amber-600 dark:text-amber-400 text-sm text-center">
          Please map at least Name or Phone column
        </p>
      )}

      {/* Sample Preview */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Column Preview:</p>
        <div className="overflow-x-auto">
          <div className="flex gap-2">
            {headers.map((header, idx) => (
              <div
                key={idx}
                className={`
                  px-3 py-2 rounded-lg text-sm whitespace-nowrap
                  ${Object.values(mapping).includes(idx)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }
                `}
              >
                {header || `Column ${idx + 1}`}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!isValid}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Preview Contacts
        </button>
      </div>
    </div>
  );
}
