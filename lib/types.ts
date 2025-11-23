export interface Contact {
  firstName: string;
  lastName: string;
  fullName: string;
  phone: string;
  email?: string;
  company?: string;
  notes?: string;
}

export interface ColumnMapping {
  name: number | null;
  phone: number | null;
  email: number | null;
  company: number | null;
  notes: number | null;
}

export interface SpreadsheetData {
  headers: string[];
  rows: string[][];
  suggestedMapping: ColumnMapping;
}

export type AppStep = 'upload' | 'mapping' | 'preview' | 'export';
