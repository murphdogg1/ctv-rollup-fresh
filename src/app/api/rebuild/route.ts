import { NextResponse } from 'next/server';
import { db } from '@/server/db';

export async function POST() {
  try {
    
    
    // Refresh views (this will recalculate all rollups)
    await db.exec('REFRESH VIEW events_norm');
    await db.exec('REFRESH VIEW events_dedup');
    await db.exec('REFRESH VIEW rollup_app');
    await db.exec('REFRESH VIEW rollup_genre');
    await db.exec('REFRESH VIEW rollup_content');
    
    return NextResponse.json({ success: true, message: 'Views refreshed successfully' });
  } catch (error) {
    console.error('Rebuild error:', error);
    return NextResponse.json(
      { error: 'Failed to rebuild views' },
      { status: 500 }
    );
  }
}
