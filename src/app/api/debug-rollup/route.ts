import { NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get("campaign_id")
    
    if (!campaignId) {
      return NextResponse.json({
        success: false,
        error: "campaign_id parameter required"
      })
    }
    
    // Test all rollup methods
    const [appRollup, genreRollup, contentRollup, campaign] = await Promise.all([
      DatabaseService.getAppRollup(campaignId),
      DatabaseService.getGenreRollup(campaignId),
      DatabaseService.getContentRollup(campaignId),
      DatabaseService.getCampaignById(campaignId)
    ])
    
    // Also get raw content data
    const rawContent = await DatabaseService.getContentData(campaignId)
    
    return NextResponse.json({
      success: true,
      campaign,
      appRollup: {
        count: appRollup.length,
        data: appRollup.slice(0, 3) // First 3 items
      },
      genreRollup: {
        count: genreRollup.length,
        data: genreRollup.slice(0, 3) // First 3 items
      },
      contentRollup: {
        count: contentRollup.length,
        data: contentRollup.slice(0, 3) // First 3 items
      },
      rawContent: {
        count: rawContent.length,
        sample: rawContent.slice(0, 3) // First 3 items
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
    }
}
