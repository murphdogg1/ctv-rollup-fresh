import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    
    console.log("=== DATABASE SERVICE DEBUG ===")
    console.log("Campaign ID:", campaignId)
    console.log("DB_ENGINE:", process.env.DB_ENGINE)
    
    // Call DatabaseService directly
    const result = await DatabaseService.getAppRollup(campaignId)
    
    console.log("DatabaseService result:", result)
    console.log("Result length:", result?.length || 0)
    
    return NextResponse.json({
      success: true,
      campaignId,
      dbEngine: process.env.DB_ENGINE,
      result: {
        count: result?.length || 0,
        data: result || []
      }
    })
    
  } catch (error) {
    console.error("DatabaseService debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
