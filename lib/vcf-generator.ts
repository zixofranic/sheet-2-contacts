import { Contact } from './types';

function escapeVCF(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters except + at the start
  let cleaned = phone.replace(/[^\d+]/g, '');
  // Ensure + is only at the beginning
  if (cleaned.includes('+')) {
    const plusIndex = cleaned.indexOf('+');
    if (plusIndex > 0) {
      cleaned = cleaned.replace(/\+/g, '');
    }
  }
  // Return empty if no digits
  if (!/\d/.test(cleaned)) {
    return '';
  }
  return cleaned;
}

export function generateVCard(contact: Contact): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',  // iOS requires 3.0 for proper multi-contact import
  ];

  // Name - handle single name vs full name
  const nameParts = contact.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  lines.push(`N:${escapeVCF(lastName)};${escapeVCF(firstName)};;;`);
  lines.push(`FN:${escapeVCF(contact.fullName)}`);

  // Phone - iOS 3.0 format with type= syntax
  if (contact.phone) {
    const formattedPhone = formatPhoneNumber(contact.phone);
    if (formattedPhone) {
      lines.push(`TEL;type=CELL:${formattedPhone}`);
    }
  }

  // Email
  if (contact.email && contact.email.includes('@')) {
    lines.push(`EMAIL:${escapeVCF(contact.email)}`);
  }

  // Company
  if (contact.company) {
    lines.push(`ORG:${escapeVCF(contact.company)}`);
  }

  // Notes
  if (contact.notes) {
    lines.push(`NOTE:${escapeVCF(contact.notes)}`);
  }

  lines.push('END:VCARD');

  return lines.join('\r\n');
}

export function generateVCFFile(contacts: Contact[]): string {
  // Generate each vCard and join with proper line endings
  // iOS requires exact formatting: each vCard ends with \r\n, then blank line between
  const vCards = contacts.map(generateVCard);
  return vCards.join('\r\n\r\n') + '\r\n';
}

export function downloadVCF(contacts: Contact[], filename: string = 'contacts.vcf'): void {
  const vcfContent = generateVCFFile(contacts);
  // Use text/x-vcard for better iOS compatibility
  const blob = new Blob([vcfContent], { type: 'text/x-vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export function getVCFDataUrl(contacts: Contact[]): string {
  const vcfContent = generateVCFFile(contacts);
  // Use TextEncoder for proper UTF-8 encoding
  const encoder = new TextEncoder();
  const uint8Array = encoder.encode(vcfContent);
  const binaryString = Array.from(uint8Array, byte => String.fromCharCode(byte)).join('');
  const base64 = btoa(binaryString);
  return `data:text/x-vcard;base64,${base64}`;
}
