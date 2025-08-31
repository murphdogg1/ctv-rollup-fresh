import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    
    console.log("=== SIMPLE DEBUG ===")
    console.log("Campaign ID:", campaignId)
    
    const result = await DatabaseService.getAppRollup(campaignId)
    
    return NextResponse.json({
      success: true,
      campaignId,
      result: {
        count: result.length,
        data: result
      }
    })
    
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
