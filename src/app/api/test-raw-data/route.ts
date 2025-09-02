import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      )
    }
    
    const supabase = createServiceClient()
    
    // Test raw data with zero impressions
    const { data: rawData, error: rawError } = await supabase
      .from('campaign_content_raw')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('impression', 0)
      .limit(5)
    
    if (rawError) {
      console.error('Raw data error:', rawError)
      return NextResponse.json(
        { success: false, error: `Raw data error: ${rawError.message}` },
        { status: 500 }
      )
    }
    
    // Test campaign_content_clean view
    const { data: cleanData, error: cleanError } = await supabase
      .from('campaign_content_clean')
      .select('*')
      .eq('campaign_id', campaignId)
      .limit(5)
    
    if (cleanError) {
      console.error('Clean data error:', cleanError)
      return NextResponse.json(
        { success: false, error: `Clean data error: ${cleanError.message}` },
        { status: 500 }
      )
    }
    
    // Test rollup view
    const { data: rollupData, error: rollupError } = await supabase
      .from('rr_rollup_app')
      .select('*')
      .eq('campaign_id', campaignId)
      .limit(5)
    
    if (rollupError) {
      console.error('Rollup data error:', rollupError)
      return NextResponse.json(
        { success: false, error: `Rollup data error: ${rollupError.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: {
        rawDataWithZeroImpressions: rawData,
        cleanData: cleanData,
        rollupData: rollupData,
        rawDataCount: rawData?.length || 0,
        cleanDataCount: cleanData?.length || 0,
        rollupDataCount: rollupData?.length || 0
      }
    })
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json(
      { success: false, error: 'Test failed' },
      { status: 500 }
    )
  }
}
