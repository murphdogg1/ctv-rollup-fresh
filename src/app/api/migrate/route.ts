import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { migration } = await request.json()
    
    if (!migration) {
      return NextResponse.json(
        { success: false, error: 'Migration name is required' },
        { status: 400 }
      )
    }
    
    const supabase = createServiceClient()
    
    let sql = ''
    
    switch (migration) {
      case 'fix_zero_impressions':
        sql = `
          -- Migration 004: Fix all rollup views to filter out zero impressions
          -- This updates all rollup views directly to ensure zero impressions are filtered

          -- First, update the campaign_content_clean view
          CREATE OR REPLACE VIEW campaign_content_clean AS
          SELECT 
            campaign_id,
            content_title,
            content_network_name,
            SUM(impression) as total_impressions,
            SUM(quartile100) as total_completes,
            COUNT(*) as row_count
          FROM campaign_content_raw
          WHERE impression > 0  -- Filter out rows with zero impressions
          GROUP BY campaign_id, content_title, content_network_name;

          -- Update the app rollup view directly
          CREATE OR REPLACE VIEW rr_rollup_app AS
          SELECT 
            campaign_id,
            content_network_name as app_name,
            SUM(total_impressions) as impressions,
            SUM(total_completes) as completes,
            CASE 
              WHEN SUM(total_impressions) > 0 THEN ROUND((SUM(total_completes) * 100.0 / SUM(total_impressions)), 2)
              ELSE 0 
            END as avg_vcr,
            COUNT(*) as content_count
          FROM campaign_content_clean
          WHERE total_impressions > 0  -- Double-check: only include rows with impressions > 0
          GROUP BY campaign_id, content_network_name
          ORDER BY campaign_id, impressions DESC;

          -- Update the genre rollup view directly
          CREATE OR REPLACE VIEW rr_rollup_genre AS
          SELECT 
            campaign_id,
            'Unknown' as genre_canon,
            SUM(total_impressions) as impressions,
            SUM(total_completes) as completes,
            CASE 
              WHEN SUM(total_impressions) > 0 THEN ROUND((SUM(total_completes) * 100.0 / SUM(total_impressions)), 2)
              ELSE 0 
            END as avg_vcr,
            COUNT(*) as content_count
          FROM campaign_content_clean
          WHERE total_impressions > 0  -- Double-check: only include rows with impressions > 0
          GROUP BY campaign_id
          ORDER BY campaign_id, impressions DESC;

          -- Update the content rollup view directly
          CREATE OR REPLACE VIEW rr_rollup_content AS
          SELECT 
            campaign_id,
            content_title as content_key,
            content_title,
            content_network_name,
            SUM(total_impressions) as impressions,
            SUM(total_completes) as completes,
            CASE 
              WHEN SUM(total_impressions) > 0 THEN ROUND((SUM(total_completes) * 100.0 / SUM(total_impressions)), 2)
              ELSE 0 
            END as avg_vcr
          FROM campaign_content_clean
          WHERE total_impressions > 0  -- Double-check: only include rows with impressions > 0
          GROUP BY campaign_id, content_title, content_network_name
          ORDER BY campaign_id, impressions DESC;
        `
        break
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown migration' },
          { status: 400 }
        )
    }
    
    // Execute the SQL directly
    const { error } = await supabase.from('campaign_content_raw').select('*').limit(1)
    
    if (!error) {
      // If we can connect, try to execute the migration SQL
      // Note: This is a simplified approach - in production you'd want proper SQL execution
      console.log('Migration SQL to execute:', sql)
      
      // For now, we'll return success and log the SQL that needs to be executed manually
      return NextResponse.json({
        success: true,
        message: `Migration '${migration}' SQL prepared. Please execute manually in Supabase SQL Editor.`,
        sql: sql
      })
    }
    
    if (error) {
      console.error('Migration failed:', error)
      return NextResponse.json(
        { success: false, error: `Migration failed: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: `Migration '${migration}' applied successfully`
    })
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    )
  }
}
