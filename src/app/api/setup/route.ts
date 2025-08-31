import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createServiceClient()
    
    // Create campaigns table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS campaigns (
          campaign_id   TEXT PRIMARY KEY,
          campaign_name TEXT NOT NULL,
          created_at    TIMESTAMP DEFAULT now()
        );
      `
    })

    // Create campaign_uploads table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS campaign_uploads (
          upload_id     TEXT PRIMARY KEY,
          campaign_id   TEXT NOT NULL REFERENCES campaigns(campaign_id),
          filename      TEXT NOT NULL,
          stored_path   TEXT NOT NULL,
          uploaded_at   TIMESTAMP DEFAULT now()
        );
      `
    })

    // Create campaign_content_raw table
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS campaign_content_raw (
          campaign_id          TEXT NOT NULL REFERENCES campaigns(campaign_id),
          campaign_name_src    TEXT,
          content_title        TEXT,
          content_network_name TEXT,
          impression           BIGINT,
          quartile100          BIGINT
        );
      `
    })

    // Create content_aliases table if it doesn't exist
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS content_aliases (
          content_title_canon TEXT NOT NULL,
          content_key         TEXT NOT NULL,
          created_at          TIMESTAMP DEFAULT now(),
          PRIMARY KEY (content_title_canon)
        );
      `
    })

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      tables: ['campaigns', 'campaign_uploads', 'campaign_content_raw', 'content_aliases']
    })

  } catch (error) {
    console.error('Database setup failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Database setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        note: 'You may need to run the SQL script manually in Supabase SQL Editor'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    // Check what tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')

    if (error) {
      throw error
    }

    const tableNames = tables?.map(t => t.table_name) || []
    
    return NextResponse.json({
      success: true,
      existingTables: tableNames,
      requiredTables: ['campaigns', 'campaign_uploads', 'campaign_content_raw', 'content_aliases'],
      missingTables: ['campaigns', 'campaign_uploads', 'campaign_content_raw', 'content_aliases'].filter(t => !tableNames.includes(t))
    })

  } catch (error) {
    console.error('Database check failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Database check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        note: 'Check your Supabase connection and environment variables'
      },
      { status: 500 }
    )
  }
}
