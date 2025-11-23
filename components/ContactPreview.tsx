'use client';

import { useState, useMemo } from 'react';
import { Contact } from '@/lib/types';

interface ContactPreviewProps {
  contacts: Contact[];
  prefix: string;
  onPrefixChange: (prefix: string) => void;
  onBack: () => void;
  onExport: () => void;
}

const CONTACTS_PER_PAGE = 10;

export default function ContactPreview({ contacts, prefix, onPrefixChange, onBack, onExport }: ContactPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Apply prefix to contacts for preview
  const previewContacts = useMemo(() => {
    if (!prefix.trim()) return contacts;
    return contacts.map(contact => ({
      ...contact,
      fullName: `${prefix.trim()} - ${contact.fullName}`,
    }));
  }, [contacts, prefix]);

  const totalPages = Math.ceil(previewContacts.length / CONTACTS_PER_PAGE);
  const startIndex = (currentPage - 1) * CONTACTS_PER_PAGE;
  const endIndex = startIndex + CONTACTS_PER_PAGE;
  const currentContacts = previewContacts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Preview Contacts</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {contacts.length} contacts ready to export
        </p>
      </div>

      {/* Tag/Prefix Input - BEFORE the contact list */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <label className="block text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          Add a tag to identify these contacts (optional)
        </label>
        <input
          type="text"
          value={prefix}
          onChange={(e) => onPrefixChange(e.target.value)}
          placeholder="e.g., Sierra-Nov-25, OpenHouse, Facebook-Leads"
          className="w-full px-4 py-3 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
        />
        {prefix.trim() && (
          <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
            All contacts will be prefixed: <span className="font-medium">{prefix.trim()} - Name</span>
          </p>
        )}
      </div>

      {/* Contact Cards */}
      <div className="space-y-3">
        {currentContacts.map((contact, idx) => (
          <div
            key={startIndex + idx}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4"
          >
            {/* Row Number */}
            <div className="text-sm text-gray-400 w-6 text-right">
              {startIndex + idx + 1}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            {/* First page */}
            {currentPage > 2 && (
              <>
                <button
                  onClick={() => goToPage(1)}
                  className="w-8 h-8 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  1
                </button>
                {currentPage > 3 && <span className="text-gray-400">...</span>}
              </>
            )}

            {/* Page numbers around current */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => Math.abs(page - currentPage) <= 1)
              .map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`w-8 h-8 text-sm rounded-lg transition-colors ${
                    page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}

            {/* Last page */}
            {currentPage < totalPages - 1 && (
              <>
                {currentPage < totalPages - 2 && <span className="text-gray-400">...</span>}
                <button
                  onClick={() => goToPage(totalPages)}
                  className="w-8 h-8 text-sm rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      {/* Page info */}
      <p className="text-center text-sm text-gray-500">
        Showing {startIndex + 1}-{Math.min(endIndex, previewContacts.length)} of {previewContacts.length} contacts
      </p>

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
