'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Contact } from '@/lib/types';
import { downloadVCF, getVCFDataUrl, generateVCFFile } from '@/lib/vcf-generator';

interface QRCodeDisplayProps {
  contacts: Contact[];
  onStartOver: () => void;
}

export default function QRCodeDisplay({ contacts, onStartOver }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [vcfDataUrl, setVcfDataUrl] = useState<string>('');
  const [canShare, setCanShare] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    // Check if Web Share API with files is supported
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare);
  }, []);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const vcfUrl = getVCFDataUrl(contacts);
        setVcfDataUrl(vcfUrl);

        // For QR codes, we create a simple data URL
        // Note: Large contact lists won't fit in QR codes - show message
        if (contacts.length <= 5) {
          const qr = await QRCode.toDataURL(vcfUrl, {
            width: 256,
            margin: 2,
            color: { dark: '#000000', light: '#ffffff' },
          });
          setQrDataUrl(qr);
        }
      } catch (err) {
        console.error('QR generation error:', err);
      }
    };

    generateQR();
  }, [contacts]);

  const handleDownload = () => {
    downloadVCF(contacts, `contacts-${contacts.length}.vcf`);
  };

  const handleShare = async () => {
    if (!navigator.share) return;

    setIsSharing(true);
    try {
      const vcfContent = generateVCFFile(contacts);
      const file = new File([vcfContent], `contacts-${contacts.length}.vcf`, {
        type: 'text/vcard',
      });

      // Check if we can share files
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Contacts',
          text: `${contacts.length} contacts exported from Sheet to Contacts`,
        });
      } else {
        // Fallback: share just text/url
        await navigator.share({
          title: 'Sheet to Contacts',
          text: `I just exported ${contacts.length} contacts! Try it at:`,
          url: window.location.origin,
        });
      }
    } catch (err) {
      // User cancelled or share failed
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
            <p className="text-gray-600 dark:text-gray-300">Download the .vcf file</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            <p className="text-gray-600 dark:text-gray-300">Open it on your phone (email it to yourself or use AirDrop/Drive)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            <p className="text-gray-600 dark:text-gray-300">Tap &quot;Add All Contacts&quot; when prompted</p>
          </div>
        </div>
      </div>

      {/* Direct Download Link */}
      <a
        href={vcfDataUrl}
        download={`contacts-${contacts.length}.vcf`}
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
