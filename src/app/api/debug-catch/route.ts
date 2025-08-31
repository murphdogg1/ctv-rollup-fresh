import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    
    console.log("=== CATCH BLOCK DEBUG ===")
    console.log("Campaign ID:", campaignId)
    
    // Call DatabaseService with error monitoring
    let result
    let errorCaught = false
    let errorMessage = ""
    
    try {
      console.log("Calling DatabaseService.getAppRollup...")
      result = await DatabaseService.getAppRollup(campaignId)
      console.log("DatabaseService.getAppRollup completed without error")
    } catch (error) {
      errorCaught = true
      errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("DatabaseService.getAppRollup threw an error:", error)
    }
    
    return NextResponse.json({
      success: true,
      campaignId,
      errorCaught,
      errorMessage,
      result: {
        count: result?.length || 0,
        data: result || [],
        isArray: Array.isArray(result),
        type: typeof result
      }
    })
    
  } catch (error) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined
    })
    }
}
