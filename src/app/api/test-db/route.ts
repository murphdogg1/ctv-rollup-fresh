import { NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET() {
  try {
    // Test 1: Create a campaign
    console.log('Testing campaign creation...')
    const campaign = await DatabaseService.createCampaign('Test Campaign Debug')
    console.log('Campaign created:', campaign)
    
    // Test 2: Create an upload record
    console.log('Testing upload creation...')
    const upload = await DatabaseService.createCampaignUpload(
      campaign.campaign_id,
      'test.csv',
      'virtual://test/path'
    )
    console.log('Upload created:', upload)
    
    // Test 3: Insert content data
    console.log('Testing content insertion...')
    const contentData = [{
      campaign_id: campaign.campaign_id,
      campaign_name_src: 'Test Campaign',
      content_title: 'Test Content',
      content_network_name: 'Test Network',
      impression: 100,
      quartile100: 80
    }]
    
    await DatabaseService.insertContentData(contentData)
    console.log('Content data inserted successfully')
    
    // Test 4: Get row counts
    const rowCounts = await DatabaseService.getRowCounts()
    
    return NextResponse.json({
      success: true,
      message: 'All database operations successful',
      campaign: campaign,
      upload: upload,
      rowCounts: rowCounts
    })
    
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
