import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/server/db';
import { BundleMapSchema } from '@/types/events';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bundles } = body;
    
    if (!Array.isArray(bundles)) {
      return NextResponse.json(
        { error: 'Bundles array is required' },
        { status: 400 }
      );
    }
    
    // Validate each bundle
    const validatedBundles = bundles.map(bundle => BundleMapSchema.parse(bundle));
    
    
    
    // Upsert bundles
    for (const bundle of validatedBundles) {
      await db.run(`
        INSERT INTO bundle_map (raw, app_bundle, app_name, publisher, mask_reason)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT (raw) DO UPDATE SET
          app_bundle = EXCLUDED.app_bundle,
          app_name = EXCLUDED.app_name,
          publisher = EXCLUDED.publisher,
          mask_reason = EXCLUDED.mask_reason
      `, [bundle.raw, bundle.app_bundle, bundle.app_name, bundle.publisher, bundle.mask_reason]);
    }
    
    return NextResponse.json({ success: true, updated: validatedBundles.length });
  } catch (error) {
    console.error('Bundle mapping error:', error);
    return NextResponse.json(
      { error: 'Failed to update bundle mappings' },
      { status: 500 }
    );
  }
}
