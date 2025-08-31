import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { GenreMapSchema } from '@/types/events';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { genres } = body;
    
    if (!Array.isArray(genres)) {
      return NextResponse.json(
        { error: 'Genres array is required' },
        { status: 400 }
      );
    }
    
    // Validate each genre
    const validatedGenres = genres.map(genre => GenreMapSchema.parse(genre));
    
    
    
    // Upsert genres
    for (const genre of validatedGenres) {
      await db.run(`
        INSERT INTO genre_map (raw, genre_canon)
        VALUES (?, ?)
        ON CONFLICT (raw) DO UPDATE SET
          genre_canon = EXCLUDED.genre_canon
      `, [genre.raw, genre.genre_canon]);
    }
    
    return NextResponse.json({ success: true, updated: validatedGenres.length });
  } catch (error) {
    console.error('Genre mapping error:', error);
    return NextResponse.json(
      { error: 'Failed to update genre mappings' },
      { status: 500 }
    );
  }
}
