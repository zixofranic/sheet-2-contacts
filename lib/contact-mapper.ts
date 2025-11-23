import { Contact, ColumnMapping } from './types';

export function mapRowToContact(row: string[], mapping: ColumnMapping): Contact | null {
  const name = mapping.name !== null ? row[mapping.name]?.trim() : '';
  const phone = mapping.phone !== null ? row[mapping.phone]?.trim() : '';

  // Skip rows without name or phone
  if (!name && !phone) {
    return null;
  }

  // Parse name into first and last
  const nameParts = name.split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    firstName,
    lastName,
    fullName: name || phone, // Use phone as name if no name
    phone: phone,
    email: mapping.email !== null ? row[mapping.email]?.trim() : undefined,
    company: mapping.company !== null ? row[mapping.company]?.trim() : undefined,
    notes: mapping.notes !== null ? row[mapping.notes]?.trim() : undefined,
  };
}

export function mapAllRows(rows: string[][], mapping: ColumnMapping): Contact[] {
  return rows
    .map(row => mapRowToContact(row, mapping))
    .filter((contact): contact is Contact => contact !== null);
}
