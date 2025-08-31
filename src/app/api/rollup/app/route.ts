import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { AppRollupSchema } from '@/types/events';

export async function GET() {
  try {
    
    const results = await db.all('SELECT * FROM rollup_app');
    
    // Validate results
    const validatedResults = results.map(row => AppRollupSchema.parse(row));
    
    return NextResponse.json(validatedResults);
  } catch (error) {
    console.error('App rollup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch app rollup data' },
      { status: 500 }
    );
  }
}
