import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    
    console.log("Testing rollup methods for campaign:", campaignId)
    
    // Test each rollup method individually
    const appRollup = await DatabaseService.getAppRollup(campaignId)
    console.log("App rollup result:", appRollup)
    
    const genreRollup = await DatabaseService.getGenreRollup(campaignId)
    console.log("Genre rollup result:", genreRollup)
    
    const contentRollup = await DatabaseService.getContentRollup(campaignId)
    console.log("Content rollup result:", contentRollup)
    
    return NextResponse.json({
      success: true,
      campaignId,
      appRollup: {
        count: appRollup.length,
        data: appRollup
      },
      genreRollup: {
        count: genreRollup.length,
        data: genreRollup
      },
      contentRollup: {
        count: contentRollup.length,
        data: contentRollup
      }
    })
    
  } catch (error) {
    console.error("Test rollup error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
    }
}
