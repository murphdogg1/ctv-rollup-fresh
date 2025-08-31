import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (!type || !['app', 'genre', 'content'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid export type. Must be app, genre, or content' },
        { status: 400 }
      );
    }
    
    
    let data: any[] = [];
    let filename = '';
    
    switch (type) {
      case 'app':
        data = await db.all('SELECT * FROM rollup_app');
        filename = 'app_rollup.csv';
        break;
      case 'genre':
        data = await db.all('SELECT * FROM rollup_genre');
        filename = 'genre_rollup.csv';
        break;
      case 'content':
        data = await db.all('SELECT * FROM rollup_content');
        filename = 'content_rollup.csv';
        break;
    }
    
    if (data.length === 0) {
      return NextResponse.json(
        { error: 'No data to export' },
        { status: 404 }
      );
    }
    
    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return '';
          if (typeof value === 'string' && value.includes(',')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    const response = new NextResponse(csvContent);
    response.headers.set('Content-Type', 'text/csv');
    response.headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    
    return response;
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
