import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Extract sheet ID from various Google Sheets URL formats
    const sheetIdMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!sheetIdMatch) {
      return NextResponse.json(
        { error: 'Invalid Google Sheets URL' },
        { status: 400 }
      );
    }

    const sheetId = sheetIdMatch[1];

    // Try to get the sheet as CSV (works for public sheets)
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    const response = await fetch(csvUrl);

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Sheet not found. Make sure it\'s publicly accessible.' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch sheet. Ensure it\'s shared publicly (Anyone with the link).' },
        { status: response.status }
      );
    }

    const csvData = await response.text();

    if (!csvData.trim()) {
      return NextResponse.json(
        { error: 'Sheet appears to be empty' },
        { status: 400 }
      );
    }

    return NextResponse.json({ csv: csvData });
  } catch (error) {
    console.error('Google Sheets fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Google Sheet' },
      { status: 500 }
    );
  }
}
