import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { SpreadsheetData, ColumnMapping } from './types';

const NAME_PATTERNS = [
  /^name$/i,
  /^full\s*name$/i,
  /^contact\s*name$/i,
  /^client\s*name$/i,
  /^lead\s*name$/i,
  /^customer$/i,
  /^first\s*name$/i,
  /^naam$/i,
];

const PHONE_PATTERNS = [
  /^phone$/i,
  /^phone\s*number$/i,
  /^mobile$/i,
  /^cell$/i,
  /^telephone$/i,
  /^tel$/i,
  /^contact\s*number$/i,
  /^primary\s*phone$/i,
];

const EMAIL_PATTERNS = [
  /^email$/i,
  /^e-mail$/i,
  /^email\s*address$/i,
  /^mail$/i,
];

const COMPANY_PATTERNS = [
  /^company$/i,
  /^organization$/i,
  /^org$/i,
  /^business$/i,
  /^employer$/i,
  /^workplace$/i,
];

const NOTES_PATTERNS = [
  /^notes?$/i,
  /^comment$/i,
  /^remarks?$/i,
  /^description$/i,
  /^info$/i,
];

function findColumnIndex(headers: string[], patterns: RegExp[]): number | null {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]?.trim() || '';
    for (const pattern of patterns) {
      if (pattern.test(header)) {
        return i;
      }
    }
  }
  return null;
}

function suggestMapping(headers: string[]): ColumnMapping {
  return {
    name: findColumnIndex(headers, NAME_PATTERNS),
    phone: findColumnIndex(headers, PHONE_PATTERNS),
    email: findColumnIndex(headers, EMAIL_PATTERNS),
    company: findColumnIndex(headers, COMPANY_PATTERNS),
    notes: findColumnIndex(headers, NOTES_PATTERNS),
  };
}

export function parseExcel(buffer: ArrayBuffer): SpreadsheetData {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json<string[]>(firstSheet, { header: 1 });

  if (jsonData.length === 0) {
    throw new Error('Spreadsheet is empty');
  }

  const headers = (jsonData[0] || []).map(h => String(h || ''));
  const rows = jsonData.slice(1).map(row =>
    Array.isArray(row) ? row.map(cell => String(cell || '')) : []
  ).filter(row => row.some(cell => cell.trim() !== ''));

  return {
    headers,
    rows,
    suggestedMapping: suggestMapping(headers),
  };
}

export function parseCSV(text: string): Promise<SpreadsheetData> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(text, {
      complete: (results) => {
        if (results.data.length === 0) {
          reject(new Error('CSV is empty'));
          return;
        }

        const headers = (results.data[0] || []).map(h => String(h || ''));
        const rows = results.data.slice(1)
          .map(row => row.map(cell => String(cell || '')))
          .filter(row => row.some(cell => cell.trim() !== ''));

        resolve({
          headers,
          rows,
          suggestedMapping: suggestMapping(headers),
        });
      },
      error: (error: Error) => reject(error),
    });
  });
}

export async function parseFile(file: File): Promise<SpreadsheetData> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    const text = await file.text();
    return parseCSV(text);
  }

  if (['xlsx', 'xls'].includes(extension || '')) {
    const buffer = await file.arrayBuffer();
    return parseExcel(buffer);
  }

  throw new Error(`Unsupported file format: ${extension}`);
}
