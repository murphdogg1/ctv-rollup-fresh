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
          -- Update campaign_content_clean view to filter out rows with zero impressions
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
