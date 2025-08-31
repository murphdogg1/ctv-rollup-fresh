import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const campaignId = "test-campaign-debug-pk47jq"
    
    console.log("=== ENVIRONMENT CHECK DEBUG ===")
    console.log("Campaign ID:", campaignId)
    
    // Check environment variables
    const envCheck = {
      DB_ENGINE: process.env.DB_ENGINE,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasSupabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }
    
    console.log("Environment check:", envCheck)
    
    // Call DatabaseService with detailed logging
    console.log("Calling DatabaseService.getAppRollup...")
    
    let result
    let errorCaught = false
    let errorMessage = ""
    
    try {
      result = await DatabaseService.getAppRollup(campaignId)
      console.log("DatabaseService.getAppRollup completed successfully")
    } catch (error) {
      errorCaught = true
      errorMessage = error instanceof Error ? error.message : "Unknown error"
      console.error("DatabaseService.getAppRollup threw an error:", error)
    }
    
    return NextResponse.json({
      success: true,
      campaignId,
      environment: envCheck,
      execution: {
        errorCaught,
        errorMessage,
        resultCount: result?.length || 0,
        resultData: result || []
      }
    })
    
  } catch (error) {
    console.error("Environment check debug error:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
