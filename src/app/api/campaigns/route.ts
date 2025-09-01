import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET() {
  try {
    const campaigns = await DatabaseService.getCampaigns()
    
    return NextResponse.json({
      success: true,
      campaigns
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
