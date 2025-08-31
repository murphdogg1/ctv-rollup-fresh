import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    
    console.log("=== DATABASE SERVICE DEBUG ===")
    console.log("Calling DatabaseService.getAppRollup with campaignId:", campaignId)
    
    // Call the DatabaseService method with detailed error handling
    let result
    try {
      result = await DatabaseService.getAppRollup(campaignId)
      console.log("DatabaseService.getAppRollup completed successfully")
      console.log("Result:", result)
    } catch (dbError) {
      console.error("DatabaseService.getAppRollup threw an error:", dbError)
      return NextResponse.json({
        success: false,
        error: `DatabaseService error: ${dbError instanceof Error ? dbError.message : "Unknown error"}`,
        stack: dbError instanceof Error ? dbError.stack : undefined
      })
    }
    
    return NextResponse.json({
      success: true,
      campaignId,
      result: {
        count: result.length,
        data: result
      },
      isArray: Array.isArray(result),
      type: typeof result
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
