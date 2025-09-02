import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = params.id
    const rollup = await DatabaseService.getAppRollup(campaignId)
    const campaign = await DatabaseService.getCampaignById(campaignId)

    return NextResponse.json({
      success: true,
      rollup,
      campaign: campaign ? { id: campaign.campaign_id, name: campaign.campaign_name } : null
    })
  } catch (error) {
    console.error('Failed to fetch app rollup:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch app rollup' },
      { status: 500 }
    )
  }
}
