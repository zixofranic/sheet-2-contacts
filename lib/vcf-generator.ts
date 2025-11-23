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
  const cleaned = phone.replace(/[^\d+]/g, '');
  return cleaned;
}

export function generateVCard(contact: Contact): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
  ];

  // Name
  const nameParts = contact.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  lines.push(`N:${escapeVCF(lastName)};${escapeVCF(firstName)};;;`);
  lines.push(`FN:${escapeVCF(contact.fullName)}`);

  // Phone
  if (contact.phone) {
    lines.push(`TEL;TYPE=CELL:${formatPhoneNumber(contact.phone)}`);
  }

  // Email
  if (contact.email) {
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
  return contacts.map(generateVCard).join('\r\n');
}

export function downloadVCF(contacts: Contact[], filename: string = 'contacts.vcf'): void {
  const vcfContent = generateVCFFile(contacts);
  const blob = new Blob([vcfContent], { type: 'text/vcard;charset=utf-8' });
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
  const base64 = btoa(unescape(encodeURIComponent(vcfContent)));
  return `data:text/vcard;base64,${base64}`;
}
