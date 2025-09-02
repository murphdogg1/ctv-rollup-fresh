import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET() {
  try {
    const campaigns = await DatabaseService.getCampaigns()
    
    // Get statistics for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        try {
          const stats = await DatabaseService.getCampaignStats(campaign.campaign_id)
          return {
            ...campaign,
            stats
          }
        } catch (error) {
          console.warn(`Failed to get stats for campaign ${campaign.campaign_id}:`, error)
          return {
            ...campaign,
            stats: {
              totalLines: 0,
              rollupLines: 0,
              uploads: 0
            }
          }
        }
      })
    )
    
    return NextResponse.json({
      success: true,
      campaigns: campaignsWithStats
    })
  } catch (error) {
    console.error('Failed to fetch campaigns:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { campaignName } = body
    
    if (!campaignName) {
      return NextResponse.json(
        { success: false, error: 'Campaign name is required' },
        { status: 400 }
      )
    }
    
    const campaign = await DatabaseService.createCampaign(campaignName)
    
    return NextResponse.json({
      success: true,
      campaign
    })
  } catch (error) {
    console.error('Failed to create campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')
    
    if (!campaignId) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required' },
        { status: 400 }
      )
    }
    
    await DatabaseService.deleteCampaign(campaignId)
    
    return NextResponse.json({
      success: true,
      message: 'Campaign deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete campaign' },
      { status: 500 }
    )
  }
}
