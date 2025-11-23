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

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-3 text-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="hidden sm:inline">Download .vcf</span>
          <span className="sm:hidden">Download</span>
        </button>

        {canShare && (
          <button
            onClick={handleShare}
            disabled={isSharing}
            className="px-6 py-4 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-3 text-lg disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {isSharing ? 'Sharing...' : 'Share'}
          </button>
        )}
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

      {/* Instructions */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 dark:text-white mb-4">How to import:</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            <p className="text-gray-600 dark:text-gray-300">Download the .vcf file to your phone</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <p className="text-gray-600 dark:text-gray-300">Open the file, then tap the <strong>Share button</strong> (square with arrow)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <p className="text-gray-600 dark:text-gray-300">Select <strong>&quot;Contacts&quot;</strong> from the share options</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
            <p className="text-gray-600 dark:text-gray-300">Tap <strong>&quot;Add All {contacts.length} Contacts&quot;</strong></p>
          </div>
        </div>
        <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
          <strong>iOS 18 Note:</strong> If you only see one contact, use the Share button to import all.
        </p>
      </div>

      {/* How to Delete Contacts */}
      <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <h3 className="font-semibold text-red-800 dark:text-red-200 mb-4">How to remove imported contacts:</h3>
        <div className="space-y-3 text-sm text-red-700 dark:text-red-300">
          <p><strong>iPhone:</strong> Contacts → Groups → Select your import group → Delete</p>
          <p><strong>Android:</strong> Contacts → Menu → Select multiple → Delete</p>
          <p><strong>Pro tip:</strong> Search for your tag (like &quot;{prefix.trim() || 'Sierra-Nov-25'}&quot;) to find and delete all contacts from this batch!</p>
        </div>
      </div>

      {/* Direct Download Link */}
      <a
        href={vcfDataUrl}
        download={filename}
        className="block w-full px-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors text-center"
      >
        Alternative: Direct Download Link
      </a>

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
