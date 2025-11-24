'use client';

import { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode';
import { Contact } from '@/lib/types';
import { downloadVCF, getVCFDataUrl, generateVCFFile } from '@/lib/vcf-generator';

interface QRCodeDisplayProps {
  contacts: Contact[];  // Already prefixed from parent
  prefix: string;
  onStartOver: () => void;
}

export default function QRCodeDisplay({ contacts, prefix, onStartOver }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [canShare, setCanShare] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Generate VCF data URL for download link
  const vcfDataUrl = useMemo(() => {
    return getVCFDataUrl(contacts);
  }, [contacts]);

  const filename = prefix.trim()
    ? `${prefix.trim()}-${contacts.length}.vcf`
    : `contacts-${contacts.length}.vcf`;

  useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare);
  }, []);

  useEffect(() => {
    const generateQR = async () => {
      try {
        if (contacts.length <= 5) {
          const qr = await QRCode.toDataURL(vcfDataUrl, {
            width: 256,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          });
          setQrDataUrl(qr);
        } else {
          setQrDataUrl('');
        }
      } catch (err) {
        console.error('QR generation error:', err);
      }
    };

    generateQR();
  }, [contacts, vcfDataUrl]);

  const handleDownload = () => {
    downloadVCF(contacts, filename);
  };

  const handleShare = async () => {
    if (!navigator.share) return;

    setIsSharing(true);
    try {
      const vcfContent = generateVCFFile(contacts);
      const file = new File([vcfContent], filename, {
        type: 'text/x-vcard',
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Contacts',
          text: `${contacts.length} contacts exported from Sheet to Contacts`,
        });
      } else {
        await navigator.share({
          title: 'Sheet to Contacts',
          text: `I just exported ${contacts.length} contacts! Try it at:`,
          url: window.location.origin,
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Contacts Ready!</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          {contacts.length} contacts generated successfully
          {prefix.trim() && <span className="block text-sm mt-1">Tagged: {prefix.trim()}</span>}
        </p>
      </div>

      {/* Primary Actions */}
      <div className="space-y-3">
        {/* Download Button - Primary */}
        <button
          onClick={handleDownload}
          className="w-full px-6 py-5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 text-xl shadow-lg"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download {contacts.length} Contacts
        </button>

        {/* Email to Self Option */}
        {canShare && (
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-3 text-lg disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {isSharing ? 'Opening...' : 'Email / AirDrop to Phone'}
          </button>
        )}
      </div>

      {/* Clear Instructions */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">To add contacts on iPhone:</h3>
        <div className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
          <p><strong>1.</strong> Download the file (or email/AirDrop it to your phone)</p>
          <p><strong>2.</strong> Open the .vcf file from Safari downloads or Files app</p>
          <p><strong>3.</strong> Tap <strong>&quot;Add All {contacts.length} Contacts&quot;</strong></p>
        </div>
      </div>

      {/* QR Code Section */}
      {contacts.length <= 5 && qrDataUrl && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Or scan with your phone camera:
          </p>
          <img
            src={qrDataUrl}
            alt="QR Code for contacts"
            className="mx-auto rounded-lg"
          />
          <p className="text-xs text-gray-400 mt-4">
            Works on iPhone & Android
          </p>
        </div>
      )}

      {contacts.length > 5 && (
        <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                QR Code Not Available
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                QR codes work best for 5 or fewer contacts. Use the download button above to get your contacts file.
              </p>
            </div>
          </div>
        </div>
      )}


      {/* How to Delete Contacts */}
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-4">How to remove imported contacts:</h3>
        <div className="space-y-3 text-sm text-red-700 dark:text-red-300">
          <p><strong>iPhone:</strong> Contacts → Groups → Select your import group → Delete</p>
          <p><strong>Android:</strong> Contacts → Menu → Select multiple → Delete</p>
          <p><strong>Pro tip:</strong> Search for your tag (like &quot;{prefix.trim() || 'Sierra-Nov-25'}&quot;) to find and delete all contacts from this batch!</p>
        </div>
      </div>

      {/* Start Over */}
      <button
        onClick={onStartOver}
        className="w-full px-6 py-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      >
        ← Convert Another Spreadsheet
      </button>
    </div>
  );
}
