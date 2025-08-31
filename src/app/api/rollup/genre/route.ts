import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { GenreRollupSchema } from '@/types/events';

export async function GET() {
  try {
    
    const results = await db.all('SELECT * FROM rollup_genre');
    
    // Validate results
    const validatedResults = results.map(row => GenreRollupSchema.parse(row));
    
    return NextResponse.json(validatedResults);
  } catch (error) {
    console.error('Genre rollup error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch genre rollup data' },
      { status: 500 }
    );
  }
}
