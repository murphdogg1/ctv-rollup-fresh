import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { ContentRollupSchema } from '@/types/events';

export async function GET() {
  try {
    
    const results = await db.all('SELECT * FROM rollup_content');
    
    // Validate results
    const validatedResults = results.map(row => ContentRollupSchema.parse(row));
    
    return NextResponse.json(validatedResults);
  } catch (error) {
    console.error('Content rollup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch content rollup data' },
      { status: 500 }
    );
  }
}
