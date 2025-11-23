'use client';

import { Contact } from '@/lib/types';

interface ContactPreviewProps {
  contacts: Contact[];
  onBack: () => void;
  onExport: () => void;
}

export default function ContactPreview({ contacts, onBack, onExport }: ContactPreviewProps) {
  const previewContacts = contacts.slice(0, 5);
  const hasMore = contacts.length > 5;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Preview Contacts</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {contacts.length} contacts ready to export
        </p>
      </div>

      {/* Contact Cards */}
      <div className="space-y-3">
        {previewContacts.map((contact, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4"
          >
            {/* Avatar */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {contact.fullName.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-white truncate">
                {contact.fullName}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                {contact.phone && (
                  <span className="flex items-center gap-1">
                    <span>📱</span> {contact.phone}
                  </span>
                )}
                {contact.email && (
                  <span className="flex items-center gap-1">
                    <span>📧</span> {contact.email}
                  </span>
                )}
                {contact.company && (
                  <span className="flex items-center gap-1">
                    <span>🏢</span> {contact.company}
                  </span>
                )}
              </div>
              {contact.notes && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
                  {contact.notes}
                </p>
              )}
            </div>
          </div>
        ))}

        {hasMore && (
          <div className="text-center py-3 text-gray-500 dark:text-gray-400">
            ... and {contacts.length - 5} more contacts
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-950 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{contacts.length}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {contacts.filter(c => c.phone).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">With Phone</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {contacts.filter(c => c.email).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">With Email</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {contacts.filter(c => c.company).length}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">With Company</p>
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
          onClick={onExport}
          className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>Generate Contacts File</span>
          <span>📥</span>
        </button>
      </div>
    </div>
  );
}
