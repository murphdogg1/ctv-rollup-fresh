import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { ContentAliasSchema } from '@/types/events';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { aliases } = body;
    
    if (!Array.isArray(aliases)) {
      return NextResponse.json(
        { error: 'Aliases array is required' },
        { status: 400 }
      );
    }
    
    // Validate each alias
    const validatedAliases = aliases.map(alias => ContentAliasSchema.parse(alias));
    
    
    
    // Upsert aliases
    for (const alias of validatedAliases) {
      await db.run(`
        INSERT INTO content_aliases (content_title_canon, content_key)
        VALUES (?, ?)
        ON CONFLICT (content_title_canon) DO UPDATE SET
          content_key = EXCLUDED.content_key
      `, [alias.content_title_canon, alias.content_key]);
    }
    
    return NextResponse.json({ success: true, updated: validatedAliases.length });
  } catch (error) {
    console.error('Content alias mapping error:', error);
    return NextResponse.json(
      { error: 'Failed to update content aliases' },
      { status: 500 }
    );
  }
}
